#!/usr/bin/env python

import sys
import string
import logging
import signal
import optparse
import ConfigParser

# twisted server
import twisted.web.util
import twisted.web.server
import twisted.web.resource
import twisted.internet.reactor

# redbox api
import redbox

# settings file path
SETTINGS_FILE = "redbox.ini"

# location of redbox favicon
FAVICON_URL = "http://www.redbox.com/content/images/favicon.ico"

# settings parser errors
class SettingsError (Exception):
    pass

# redbox rss server
class RSSServer:

    # rss site handler
    class RSSResource (twisted.web.resource.Resource):

        # no children
        isLeaf = True

        # constructor
        def __init__ (self, server):

            # save server reference
            self.server = server

        # handle get request
        def render_GET (self, request):

            # log connection
            logging.info("GET " + request.uri)

            # redirect favicon.ico to redbox
            if request.uri == "/favicon.ico":
                return twisted.web.util.redirectTo(FAVICON_URL, request)

            # set return type as xml
            request.setHeader("Content-Type", "application/xml")

            # get latest rss feed
            response = self.server.get_rss()

            return response.encode('utf-8')

    # constructor
    def __init__ (self, config=SETTINGS_FILE):

        # get settings
        self.read_config(config)

        # setup logger
        try:
            if self.log:
                logging.basicConfig(filename=self.log, level=logging.INFO,
                    format="%(asctime)s  %(levelname)s: %(message)s")
            else:
                logging.basicConfig(level=logging.ERROR,
                    format="%(levelname)s: %(message)s")
        except IOError:
            raise SettingsError("Failed to create log '%s'" % self.log)

        # new redbox account
        self.account = redbox.Account()

        # cache descriptions
        self.desc_cache = {}

    # parse settings file
    def read_config (self, path):

        # create config parser
        config = ConfigParser.RawConfigParser()

        # load config file
        try:
            config.readfp(open(path, 'r'))
        except:
            raise SettingsError(
                "Failed to load settings file '%s'" % path)

        # get username
        try:
            self.username = config.get('login', 'username')
        except:
            raise SettingsError("Missing setting 'login'.'username'")

        # get password
        try:
            self.password = config.get('login', 'password')
        except:
            raise SettingsError("Missing setting 'login'.'password'")

        # get port
        try:
            self.port = int(config.get('server', 'port'))
        except ValueError:
            raise SettingsError("'server'.'port' non-numeric value")
        except:
            raise SettingsError("Missing setting 'server'.'port'")

        # get log
        try:
            self.log = config.get('server', 'log')
        except:
            self.log = None

    # start web server
    def start (self):

        logging.info("RSS Server Starting...")

        # perform initial login
        if not self.account.login(self.username, self.password):
            raise SettingsError("Username and/or password are incorrect")

        # create twisted site
        resource = RSSServer.RSSResource(self)
        site = twisted.web.server.Site(resource)

        # start twisted server
        try:
            twisted.internet.reactor.listenTCP(self.port, site)
            twisted.internet.reactor.callWhenRunning(
                lambda: logging.info("RSS Server Started")
            )
            twisted.internet.reactor.run()
        except twisted.internet.error.CannotListenError:
            raise SettingsError("Port '%d' already in use" % self.port)

    # stop web server
    def stop (self):

        logging.info("RSS Server Stopping...")

        # stop twisted server
        twisted.internet.reactor.stop()

        # perform logout
        self.account.logout()

        logging.info("RSS Server Stopped")

    # get recent redbox rentals
    def get_rentals (self):

        try:

            # get recent rentals (attempt 1)
            rentals = self.account.getRentalHistory()
            if not rentals:

                # first attempt failed
                logging.info("Attempting rental history retrieval again")

                # login to redbox
                if not self.account.login(self.username, self.password):
                    logging.error("Failed to login to Redbox")
                    return None

                # get recent rentals (attempt 2)
                rentals = self.account.getRentalHistory()
                if not rentals:
                    logging.error("Unable to retrieve rental history")
                    return None

        # catch internal errors
        except Exception, err:
            logging.error(err)
            return None

        return rentals

    # format rentals as rss feed
    def get_rss (self):

        # get rental history
        rentals = self.get_rentals()
        if not rentals:
            return u""

        # formats rss header
        head = u"""
        <?xml version="1.0" encoding="utf-8" ?>
        <rss version="2.0">
          <channel>
            <title>Redbox Rental History</title>
            <description>Recent rentals from redbox kiosks</description>
            <link>https://www.redbox.com/account/RentalHistory</link>
            <ttl>60</ttl>
        """.lstrip()

        # create template for body
        tmpl = string.Template(u"""
        <item>
          <title>${name}</title>
          <description>
            &lt;a href=&quot;http://www.redbox.com/movies/${PID}&quot;&gt;
              &lt;img src=&quot;http://images.redbox.com/Images/EPC/Thumb150/${PID}.jpg&quot;/&gt;
            &lt;/a&gt;
            &lt;br/&gt;
            ${desc}
          </description>
          <link>http://www.redbox.com/movies/${PID}</link>
          <guid>${PID}</guid>
        </item>
        """.lstrip())

        # formats rss footer
        tail = u"""
          </channel>
        </rss>
        """.strip()

        try:

            # process movie data
            body = ""
            for movie in rentals:

                # get movie description
                pid = movie['PID']
                if pid in self.desc_cache:
                    desc = self.desc_cache[pid]
                else:
                    detail = redbox.Product().getDetail(pid)
                    desc = detail.get('desc', "")
                    self.desc_cache[pid] = desc

                # fill tmpl with movie data
                body += tmpl.substitute(movie, desc=desc)

        # catch malformed data errors
        except KeyError, err:
            logging.error("Movie is missing %s key" % err)
            return ""
        except Exception, err:
            logging.error(err)
            return ""

        return (head + body + tail)

# stop server on ctrl+c (sigint)
def sigint_handler (signum, frame):

    # stop rss server
    server.stop()

# entry point
if __name__ == '__main__':

    # parse command line
    parser = optparse.OptionParser()
    parser.add_option("-c", "--config",
        dest="config", default=SETTINGS_FILE, metavar="FILE",
        help="server configuration file (default=%s)" % SETTINGS_FILE)
    (options, args) = parser.parse_args()

    # catch interrupt signal
    signal.signal(signal.SIGINT, sigint_handler)

    try:

        # start redbox rss server
        server = RSSServer(options.config)
        server.start()

    # catch settings file errors
    except SettingsError, err:
        sys.stderr.write("ERROR: %s\n" % err)
        sys.exit(1)

# vim: ai et ts=4 sts=4 sw=4
