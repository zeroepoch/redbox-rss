#!/usr/bin/env python
#
# Redbox RSS Server
#
# Copyright (c) 2013, Eric Work
# All rights reserved.
#
# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:
#
# * Redistributions of source code must retain the above copyright notice, this
#   list of conditions and the following disclaimer.
# * Redistributions in binary form must reproduce the above copyright notice,
#   this list of conditions and the following disclaimer in the documentation
#   and/or other materials provided with the distribution.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
#

import sys
import string
import logging
import signal
import optparse
import ConfigParser

from datetime import datetime, timedelta

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

# titles refresh interval
TITLES_TIMEOUT = 21600  # 6 hr

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
    def __init__ (self, config=SETTINGS_FILE, log=None, debug=False):

        # get settings
        self.read_config(config)

        # override log path
        if log == "-":
            self.log = None
        elif log:
            self.log = log

        # setup logger
        try:
            if self.log:
                level = { True: logging.DEBUG, False: logging.INFO }
                logging.basicConfig(filename=self.log, level=level[debug],
                    format="%(asctime)s  %(levelname)s: %(message)s")
            else:
                level = { True: logging.DEBUG, False: logging.ERROR }
                logging.basicConfig(level=level[debug],
                    format="%(levelname)s: %(message)s")
        except IOError:
            raise SettingsError("Failed to create log '%s'" % self.log)

        # set redbox api debug
        redbox.set_debug(debug)

        # new redbox account
        self.account = redbox.Account()

        # cache title list
        self.titles_cache = None
        self.titles_timestamp = (
            datetime.now() - timedelta(seconds=TITLES_TIMEOUT))

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
            &lt;a href=&quot;http://www.redbox.com/movies/${seo}&quot;&gt;
              &lt;img src=&quot;http://images.redbox.com/Images/EPC/Thumb150/${PID}.jpg&quot;/&gt;
            &lt;/a&gt;
            &lt;br/&gt;
            ${desc}
            &lt;br/&gt;
            Format: ${type}
          </description>
          <link>http://www.redbox.com/movies/${seo}</link>
          <guid>${inv}</guid>
        </item>
        """.lstrip())

        # formats rss footer
        tail = u"""
          </channel>
        </rss>
        """.strip()

        # get title list
        if ((datetime.now() - self.titles_timestamp) <
            timedelta(seconds=TITLES_TIMEOUT)):
            titles = self.titles_cache
        else:
            titles = redbox.Product().getProducts()
            self.titles_cache = titles
            self.titles_timestamp = datetime.now()

        try:

            # process movie data
            body = ""
            for movie in rentals:

                # get product id
                pid = movie['PID']

                # get movie description
                if pid in self.desc_cache:
                    desc = self.desc_cache[pid]
                else:
                    detail = redbox.Product().getDetail(pid, -1)
                    desc = detail.get('desc', "")
                    self.desc_cache[pid] = desc

                # get url short name
                title = titles.get(pid)
                if title:
                    seo = title.get('SEO', pid)
                else:
                    seo = pid

                # fill tmpl with movie data
                body += tmpl.substitute(movie, desc=desc, seo=seo)

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
    parser.add_option("-d", "--debug",
        dest="debug", default=False, action='store_true',
        help="set logging level to debug")
    parser.add_option("-l", "--log",
        dest="log", default=None, metavar="FILE",
        help="override log set in configuration file")
    (options, args) = parser.parse_args()

    # catch interrupt signal
    signal.signal(signal.SIGINT, sigint_handler)

    try:

        # start redbox rss server
        server = RSSServer(
            config=options.config, log=options.log, debug=options.debug)
        server.start()

    # catch settings file errors
    except SettingsError, err:
        sys.stderr.write("ERROR: %s\n" % err)
        sys.exit(1)

# vim: ai et ts=4 sts=4 sw=4
