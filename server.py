#!/usr/bin/env python

import sys
import string
import ConfigParser

import redbox

# format rentals as rss feed
def format_rss (rentals):

    # formats rss header
    head = """
    <?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>Redbox Rental History</title>
        <description>Recent rentals from redbox kioks</description>
        <link>https://www.redbox.com/account/RentalHistory</link>
        <ttl>60</ttl>
    """.strip()

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
    """.strip())

    # formats rss footer
    tail = """
      </channel>
    </rss>
    """.strip()

    # fill tmpl with movie data
    body = ""
    for movie in rentals:
        body += tmpl.substitute(movie)

    return (head + body + tail)

# entry point
def main ():

    # parse config file
    config = ConfigParser.RawConfigParser()
    try:
        config.read('redbox.ini')
        username = config.get('login', 'username')
        password = config.get('login', 'password')
    except:
        sys.stderr.write("ERROR: Missing settings in redbox.ini\n")
        sys.exit(1)

    # new redbox account
    account = redbox.Account()

    # login to redbox
    if not account.login(username, password):
        sys.stderr.write("ERROR: Failed to login to redbox\n")
        sys.exit(1)

    # get recent rentals
    rentals = account.getRentalHistory(10)
    if not rentals:
        sys.stderr.write("ERROR: Unable to retrieve rental history\n")
        sys.exit(1)

    # create rss output
    rss = format_rss(rentals)

    print rss

if __name__ == '__main__':
    main()

# vim: ai et ts=4 sts=4 sw=4
