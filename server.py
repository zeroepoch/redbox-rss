#!/usr/bin/env python

import sys
import string
import logging
import ConfigParser

import twisted.web
import twisted.internet

import redbox

# settings file path
SETTINGS_FILE = "redbox.ini"

# settings parser errors
class SettingsError (Exception):
    pass

# redbox rss server
class RSSServer:

    # constructor
    def __init__ (self):

        # get settings
        self.read_config()

        # setup logger
        try:
            if self.log:
                logging.basicConfig(filename=self.log,
                    format="%(asctime)s  %(levelname)s: %(message)s")
            else:
                logging.basicConfig(level=logging.ERROR,
                    format="%(levelname)s: %(message)s")
        except IOError:
            raise SettingsError("Failed to create log '{}'".format(self.log))

        # new redbox account
        self.account = redbox.Account()

    # parse settings files
    def read_config (self):

        # create config parser
        config = ConfigParser.RawConfigParser()

        # load config file
        try:
            config.readfp(open(SETTINGS_FILE, 'r'))
        except:
            raise SettingsError(
                "Failed to load settings file '{}'".format(SETTINGS_FILE))

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

    # get recent redbox rentals
    def get_rentals (self):

        try:

            # login to redbox
            if not self.account.login(self.username, self.password):
                logging.error("Failed to login to redbox")
                return None

            # get recent rentals
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
            return ""

        # formats rss header
        head = """
        <?xml version="1.0" encoding="UTF-8" ?>
        <rss version="2.0">
          <channel>
            <title>Redbox Rental History</title>
            <description>Recent rentals from redbox kioks</description>
            <link>https://www.redbox.com/account/RentalHistory</link>
            <ttl>60</ttl>
        """.lstrip()

        # create template for body
        tmpl = string.Template("""
        <item>
          <title>${name}</title>
          <description>
            &lt;a href=&quot;http://www.redbox.com/movies/${PID}&quot;&gt;
              &lt;img src=&quot;http://images.redbox.com/Images/EPC/Thumb150/${PID}.jpg&quot;/&gt;
            &lt;/a&gt;
          </description>
          <link>http://www.redbox.com/movies/${PID}</link>
          <guid>${PID}</guid>
        </item>
        """.lstrip())

        # formats rss footer
        tail = """
          </channel>
        </rss>
        """.strip()

        # fill tmpl with movie data
        try:
            body = ""
            for movie in rentals:
                body += tmpl.substitute(movie)
        except KeyError, err:
            logging.error("Movie is missing {} key".format(err))
            return ""
        except Exception, err:
            logging.error(err)
            return ""

        return (head + body + tail)

# entry point
if __name__ == '__main__':

    # create redbox rss server
    try:
        server = RSSServer()
    except SettingsError, err:
        sys.stderr.write("ERROR: {}\n".format(err))
        sys.exit(1)

    # print rss feed to screen
    print server.get_rss()

# vim: ai et ts=4 sts=4 sw=4
