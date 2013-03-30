#
# Redbox API Library
#

#
# Redbox requires two key pieces of information in order to login to their
# website. The first piece is an API key and the second piece is an user
# identification cookie.
#
# The API key changes over time (probably because it's public) but it's given
# with each page request. If a page is requested before each API call then the
# key will always be valid. Once logged in some requests don't actually require
# the API key due to an authentication cookie. Just to be safe the API key is
# extracted each time similar to how it would be in real life when the user is
# navigating pages. Once the API key is extracted it gets passed to the server
# by setting the '__K' HTTP header while constructing the page request.
#
# The user identification cookie is named 'rbuser'. This cookie is provided
# with just about every page request. Conveniently the same page request needed
# to extract the API key can be used to initialize the identification cookie.
# Since the cookie jar is persistent across all page requests this is trivial
# to manage.
#
# API requests are given in JSON format. API responses are returned in JSON
# format. The structure of a API request is unique to the API being called. The
# basic structure of an API response looks like:
#
# d: {
#   data: {
#     <payload>
#   }
#   msg: None/str
#   success: True/False
# }
#
# Usually when 'success' is false, 'msg' will contain the error message. The
# 'data' value contains a structure unique to the API being called.
#
# The length of time that the authenticated session will remain valid may be
# determined by looking at the expiration date on a cookie name '.Redbox'.
# Although this has not yet been verified.
#

import sys
import re
import urllib2
import cookielib

try:
    import json
except ImportError:
    import simplejson as json

# redbox urls
REDBOX_API_URL = "https://www.redbox.com/api"
REDBOX_API_KEY_URL = "http://www.redbox.com/register"

# api key extraction errors
class APIKeyError (Exception):
    pass

# http fetch errors
class HTTPError (Exception):

    def __init__ (self, url, html):
        self.url = url
        self.html = html

    def __str__ (self):
        return "Request to fetch '{}' failed".format(self.url)

# json parsing errors
class JSONError (Exception):
    pass

# Redbox Account Class (rb.api.account)
class Account:

    # constructor
    def __init__ (self):

        # create url opener
        self.cookie_jar = cookielib.CookieJar()
        self.url_opener = urllib2.build_opener(
            urllib2.HTTPCookieProcessor(self.cookie_jar))

    # get dynamic api key
    def _get_api_key (self):

        # regex for locating api key
        re_api_key = re.compile(r"\brb\.api\.key\s*=\s*'([^']+)'\s*;")

        # fetch login page
        try:
            response = self.url_opener.open(REDBOX_API_KEY_URL)
        except urllib2.HTTPError, err:
            raise HTTPError(REDBOX_API_KEY_URL, err.read())

        # find redbox api key
        html = response.read()
        mat_api_key = re_api_key.search(html)
        if mat_api_key:
            api_key = mat_api_key.group(1).strip()
        else:
            raise APIKeyError("Redbox API key not found")

        return api_key

    # perform ajax operation
    def _ajax (self, url, data):

        # get redbox api key
        api_key = self._get_api_key()

        # build api request
        request = urllib2.Request(REDBOX_API_URL + url)
        request.add_header("__K", api_key)
        request.add_data(json.dumps(data))

        # fetch api data
        try:
            response = self.url_opener.open(request)
        except urllib2.HTTPError, err:
            raise HTTPError(REDBOX_API_URL + url, err.read())

        # decode returned json
        try:
            result_json = json.load(response)
        except ValueError, err:
            raise JSONError(err)

        # check for root key
        d = result_json.get('d')
        if (not d) or (not isinstance(d, dict)):
            raise JSONError("Root key 'd' is missing or invalid")

        # check if request successful
        if not d.get('success'):
            msg = d.get('msg', "Unknown, API message missing")
            sys.stderr.write("ERROR: {}\n".format(msg))
            return None

        return d.get('data')

    # login to the redbox website
    def login (self, username, password):

        # construct api request
        data = {
            'userName': username,
            'password': password,
            'createPersistentCookie': True
        }

        # perform api call
        result = self._ajax("/Account/Login", data)
        if not result:
            return False

        # check login result
        if not result.get('loggedIn'):
            return False

        return True

    # get the last <count> rentals
    def getRentalHistory (self, count=10):

        # construct api request
        data = {
            'page': 1,
            'pageSize': count,
            'id': None,
            'direction': -1
        }

        # perform api call
        result = self._ajax("/Account/GetRentalHistory", data)
        if not result:
            return None

        return result.get('Data')

    # TODO: implement additional API calls

# vim: ai et ts=4 sts=4 sw=4
