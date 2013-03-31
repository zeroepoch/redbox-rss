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
# For additional information about the structure of each API call see:
#   docs/rb.global.js
#
# The length of time that an authenticated session will remain valid may be
# related to the expiration date on a cookie name '.Redbox'. This has not yet
# been verified.
#

import sys
import re
import logging
import urllib
import urllib2
import cookielib

from datetime import datetime, timedelta

try:
    import json
except ImportError:
    import simplejson as json

# redbox urls
REDBOX_API_URL = "https://www.redbox.com/api"
REDBOX_API_KEY_URL = "http://www.redbox.com/register"

# api key refresh interval
API_KEY_TIMEOUT = 60  # 1 min

# enable/disable library debug
_redbox_debug = False
def set_debug (val):
    global _redbox_debug
    _redbox_debug = val

# cache api key
_api_key_cache = None
_api_key_timestamp = (
    datetime.now() - timedelta(seconds=API_KEY_TIMEOUT))

# api key extraction errors
class APIKeyError (Exception):
    pass

# http fetch errors
class HTTPError (Exception):

    def __init__ (self, url, html):
        self.url = url
        self.html = html

    def __str__ (self):
        return "Request to fetch '%s' failed" % self.url

# json parsing errors
class JSONError (Exception):
    pass

# Redbox Base Class (rb.api)
class RedboxAPI:

    # regex for locating api key
    re_api_key = re.compile(r"\brb\.api\.key\s*=\s*'([^']+)'\s*;")

    # global cookie jar
    cookie_jar = cookielib.CookieJar()

    # page request methods
    class Method:
        GET  = 1
        POST = 2

    # constructor
    def __init__ (self):

        # create url opener
        self.url_opener = urllib2.build_opener(
            urllib2.HTTPCookieProcessor(self.cookie_jar))

    # get dynamic api key
    def _get_api_key (self):

        global _api_key_cache
        global _api_key_timestamp

        # check api key cache
        if ((datetime.now() - _api_key_timestamp) <
            timedelta(seconds=API_KEY_TIMEOUT)):
            return _api_key_cache

        # log api key request
        if _redbox_debug:
            logging.debug("API KEY " + REDBOX_API_KEY_URL)

        # fetch login page
        try:
            response = self.url_opener.open(REDBOX_API_KEY_URL)
        except urllib2.HTTPError, err:
            raise HTTPError(REDBOX_API_KEY_URL, err.read())

        # find redbox api key
        html = response.read()
        mat_api_key = self.re_api_key.search(html)
        if mat_api_key:
            api_key = mat_api_key.group(1).strip()
        else:
            raise APIKeyError("Redbox API key not found")

        # update api key cache
        _api_key_cache = api_key
        _api_key_timestamp = datetime.now()

        return api_key

    # perform ajax operation
    def _ajax (self, method, url, data):

        # get redbox api key
        api_key = self._get_api_key()

        # format request url
        request_url = REDBOX_API_URL + url
        if method == RedboxAPI.Method.GET:
            request_url += "?" + urllib.urlencode(data)

        # build api request
        request = urllib2.Request(request_url)
        request.add_header("__K", api_key)
        if method == RedboxAPI.Method.POST:
            request.add_data(json.dumps(data))

        # log api request
        if _redbox_debug:
            logging.debug("API " + request_url)

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
            sys.stderr.write("ERROR: %s\n" % msg)
            return None

        return d.get('data')

# Redbox Product Class (rb.api.product)
class Product (RedboxAPI):

    # get product details by id
    def getDetail (self, pid, length=300):

        # construct api request
        data = {
            'descriptionLimit': length
        }

        # perform api call
        url = "/product/details/%d" % pid
        result = self._ajax(RedboxAPI.Method.GET, url, data)
        if not result:
            return ""

        return result

# Redbox Account Class (rb.api.account)
class Account (RedboxAPI):

    # login to the redbox website
    def login (self, username, password):

        # construct api request
        data = {
            'userName': username,
            'password': password,
            'createPersistentCookie': True
        }

        # perform api call
        result = self._ajax(
            RedboxAPI.Method.POST, "/Account/Login", data)
        if not result:
            return False

        # check login result
        if not result.get('loggedIn'):
            return False

        return True

    # logout from the redbox website
    def logout (self):

        # construct api request
        data = {
            'returnUrl': "http://www.redbox.com"
        }

        # perform api call
        self._ajax(RedboxAPI.Method.POST, "/Account/Logout", data)

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
        result = self._ajax(
            RedboxAPI.Method.POST, "/Account/GetRentalHistory", data)
        if not result:
            return None

        return result.get('Data')

# vim: ai et ts=4 sts=4 sw=4
