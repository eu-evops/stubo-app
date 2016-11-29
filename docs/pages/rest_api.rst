REST API v2
===========

Mirage REST API v2 returns JSON. The response always returns the
version, and payload. Responses are similar to v1 API responses. The
payload is either contained under 'data' if the response is successful
or 'error' for errors. Errors contain a descriptive message under
'message' and the http error code under 'code'. Successful responses
depend on the call made and are described below.

Encoding "application/json"

Create scenario object
----------------------

Creates scenario object. Client must specify scenario name in the
request body.

-  **URL**: /api/v2/scenarios
-  **Method**: PUT
-  **Response codes**:
-  **201** - scenario created
-  **422** - scenario with that name already exists
-  **400** - something is missing (e.g. name)
-  **Example request body**:

   .. code:: javascript

       {
         "scenario": "scenario_name"
       }

Upload scenario with session & stubs
------------------------------------

You can upload existing scenarios directly into Mirage via this API
call. Currently it only accepts .zip format and only .yaml configuration
file.

-  **URL**: /api/v2/scenarios/upload
-  **Method**: POST
-  **Encoding**: "multipart/form-data"
-  **Response codes**:
-  **200** - Scenario uploaded successfully.
-  **415** - Content type not supported (format not accepted).
-  **400** - Configuration file found, however failed to read it.
-  **422** - Scenario already exists.

Example scenario\_x.zip content structure:

::

    scenario_x.yaml
    stub_0.json
    stub_1.json
    stub_2.json
    stub_3.json
    stub_4.json

As you can see - everything is expected to be in the same directory, no
inner directory structure is expected.

Defining .yaml configuration:

::

    recording:
      scenario: scenario_x
      session: session_x

Note that by default Mirage exported yaml file looks like this:

::

    recording:
      scenario: scenario_x
      session: session_x
      stubs:
      - file: stub_0.json
      - file: stub_1.json
      - file: stub_2.json
      - file: stub_3.json
      - file: stub_4.json

Although, during upload it ignores "stubs" key and treats every .json
file in the archived zip as a separate stub.

When Mirage finds yaml configuration - it gets scenario name and creates
it. After that - reads every file from the archive that ends with
".json". After all the stubs were added to the database - starts a
session in playback mode. Scenario is then ready for testing.

Example stub .json structure:

::

    {
       "priority": 9903,
       "args": {
          "priority": "9903"
       },
       "request": {
          "bodyPatterns": {
             "contains": [
                "<tag> matcher here </tag>"
             ]
          },  
          "method": "POST"
       },
       "response": {
          "body": "<response> Response here </response>\n",
          "headers":
          "status": 200
       }
    }

Example upload (Python)
~~~~~~~~~~~~~~~~~~~~~~~

Below is an example pseudocode for uploading files to Mirage:

::

    def upload(file_name, mirage_uri):
        """
        file_name - path to zip archive.
        mirage_uri - full Mirage URL (http://miragehostname:8001)
        """
        # reading file
        with open(file_name, 'r') as stream:
            # preparing data
            files = [('files', (file_name, stream, 'application/zip'))]
            data = {}

            resp = requests.post(mirage_uri + "/api/v2/scenarios/upload",
                                 files=files, data=data)
            if resp.status_code == 200:
                print("Upload success!")
        return

You can upload multiple archives at once. Every archive should be self
contained - yaml configuration and stubs archived together.

Get scenario list
-----------------

Returns a list of scenarios with their name and scenarioRef attributes.
This attribute can the be used to get scenario details (sessions, stubs,
size, etc...). Your application can look for these keys and use them to
directly access resource instead of generating URL on client side.

-  **URL**: /api/v2/scenarios
-  **Method**: GET
-  **Response codes**:
-  **200** - scenario list returned
-  **Example output**:

   .. code:: javascript

       {
         "data": [
           {"scenarioRef": "/api/v2/scenarios/objects/localhost:scenario_1",
           "name": "localhost:scenario_1"},
           {"scenarioRef": "/api/v2/scenarios/objects/localhost:scenario_10",
            "name": "localhost:scenario_10"},
            ...,
            ...,
            ]
       }

   Get scenario list with details
   ------------------------------

Returns a list of scenarios with details.

-  **URL**: /api/v2/scenarios/detail
-  **Method**: GET
-  **Response codes**:
-  **200** - scenario list with details returned
-  **Example output**:

   .. code:: javascript

       {
         "data": [
         {
           "space_used_kb": 0,
           "name": "localhost:scenario_1",
           "sessions": [],
           "scenarioRef": "/api/v2/scenarios/objects/localhost:scenario_1",
           "recorded": "-",
           "stub_count": 0},
         {
           "space_used_kb": 544,
           "name": "localhost:scenario_10",
           "sessions": [
               {
                 "status": "playback",
                 "loaded": "2015-07-20",
                 "name": "playback_10",
                 "last_used": "2015-07-20 13:09:05"}
               ],
            "scenarioRef": "/api/v2/scenarios/objects/localhost:scenario_10",
            "recorded": "2015-07-20",
            "stub_count": 20},
            ...,
            ...,
          ]
       }

Get scenario details
--------------------

Returns specified scenario details. Scenario name can be provided with a
host, for example stubo\_c1.yourcorporateaddress.com:scenario\_name\_x

-  **URL**: /api/v2/scenarios/objects/
-  **Method**: GET
-  **Response codes**:
-  **200** - specified scenario details
-  **404** - specified scenario not found
-  **Example output**:

   .. code:: javascript

       {
         "space_used_kb": 697,
         "name": "localhost:scenario_13",
         "sessions": [
           {"status": "playback",
           "loaded": "2015-07-20",
           "name": "playback_13",
            "last_used": "2015-07-20 13:09:05"}
          ],
          "stubs": 26,
          "recorded": "2015-07-20",
          "scenarioRef": "/api/v2/scenarios/objects/localhost:scenario_13"
        }

Delete scenario
---------------

Deletes scenario object and removed it's stubs from cache.

-  **URL**: /api/v2/scenarios/objects/
-  **Method**: DELETE
-  **Response codes**:
-  **200** - scenario deleted
-  **412** - precondition failed - specified scenario does not exist

Begin session and set mode
--------------------------

Begins session for specified scenario. Client has to specify session
name and mode in request body. Session mode can be either 'record' and
'playback'.

-  **URL**: /api/v2/scenarios/objects//action
-  **Method**: POST
-  **Response codes**:
-  **200** - begins session
-  **400** - something went wrong (e.g. session already exists)
-  **Example request body**:

   .. code:: javascript

       {
         "begin": null,
         "session": "session_name",
         "mode": "record"
       }

-  **Example output**:

   .. code:: javascript

       {
         "version": "0.6.6",
         "error":
            {"message": "Scenario (localhost:scenario_10) has existing stubs, delete them before recording or create another scenario!",
            "code": 400}
       }

End session
-----------

Ends specified session. Client has to specify session name in request
body.

-  **URL**: /api/v2/scenarios/objects//action
-  **Method**: POST
-  **Response codes**:
-  **200** - session ended.
-  **Example request body**:

   .. code:: javascript

       {
         "end": null,
         "session": "playback_28"
       }

-  **Example output**:

   .. code:: javascript

       {
         "version": "0.6.6",
         "data": {
            "message": "Session ended"}
        }

End all sessions for specific scenario
--------------------------------------

Ends all sessions for specified scenario

-  **URL**: /api/v2/scenarios/objects//action
-  **Method**: POST
-  **Response codes**:
-  **200** - scenario list with details returned
-  **Example request body**:

.. code:: javascript

    {
      "end": "sessions"
    }

-  **Example output**:

.. code:: javascript

    {
      "version": "0.6.6",
      "data": {
          "playback_20": {"message": "Session ended"}
          }
    }

Add stub
--------

Add stub to scenario

-  **URL**: /api/v2/scenarios/objects/(?P[^\\/]+)/stubs
-  **Method**: PUT
-  **Response codes**:
-  **201** - inserted
-  **200** - updated or ignored
-  **Example request body**:

   .. code:: javascript

        {
            "request": {
                "method": "POST",
                "bodyPatterns": [
                    { "contains": ["<status>IS_OK2</status>"] }
                ]
                },
            "response": {
                "status": 200,
                "body": "<response>YES</response>"
            }
        }

-  **Example output**: If updated (status code 200)

   .. code:: javascript

       {
           version: "0.7"
           data: {
           message: "updated with stateful response"
           }
        }

or inserted (status code 201).

.. code:: javascript

    {
        version: "0.6.6"
        data: {
        message: "inserted scenario_stub: 55d5e7ebfc4562fb398dc697"
    }

Here this ID - 55d5e7ebfc4562fb398dc697 is an object \_id field from
database. Proxy or an integrator could actually go directly to database
with this key and retrieve response.

Getting response with stub
--------------------------

-  **URL**: /api/v2/scenarios/objects/(?P[^\\/]+)/stubs
-  **Method**: POST
-  **Response codes**:
-  \_\_\*\_\_ - any HTTTP response that user defined during stub
   insertion

-  **Example request header**: session: your\_session\_name

-  **Example request body**:

   .. code:: javascript

       matcher here

Getting request response data (JSON)
------------------------------------

This call is similar to "Getting response with stub", however this one
is intended to give all the data to the client to build original
response instead of returning original response. This enables storing
encoded/encrypted responses. Users have to provide a scenario:session
key in headers.

-  **URL**: /api/v2/matcher
-  **Method**: POST
-  **Response codes**:
-  **200** - Response found
-  **404** - Response not found

-  **Example request header**: session: scenario\_name:session\_name

-  **Example request body**:

   .. code:: javascript

       matcher here

-  **Example response body**: \`\`\`javascript { "body": "body bytes or
   plain text here", "headers": { "key": "value", "key1": "value1" }
   "statusCode": 200 }

\`\`\`

Get all stubs for specific scenario
-----------------------------------

-  **URL**: /api/v2/scenarios/objects/(?P[^\\/]+)/stubs
-  **Method**: GET
-  **Response codes**:
-  **200** - stub list returned

.. code:: javascript

    {
        "version": "0.7",
        "data": [
            {
                "stub": {
                    "priority": -1,
                    "request": {
                        "bodyPatterns": {
                            "contains": [
                                "<status>IS_OK2</status>"
                            ]
                        },
                        "method": "POST"
                    },
                    "args": {},
                    "recorded": "2015-10-08",
                    "response": {
                        "status": 123,
                        "body": "<response>YES</response>"
                    }
                },
                "matchers_hash": "a92fa6cf96f218598d3723f2827a6815",
                "space_used": 219,
                "recorded": "2015-10-08",
                "scenario": "localhost:scenario_name_1"
            }
        ]
    }

Delete all scenario stubs
-------------------------

-  **URL**: /api/v2/scenarios/objects/(?P[^\\/]+)/stubs
-  **Method**: DELETE
-  **Response codes**:
-  **200** - stubs deleted
-  **409** - precondition failed - there are active sessions either in
   playback or record mode

Get delay policy list
---------------------

Gets all defined delay policies

-  **URL**: /api/v2/delay-policy/detail
-  **Method**: GET
-  **Response codes**:
-  **200** - list with delay policies returned
-  **Example output**:

.. code:: javascript

    {
      "version": "0.6.6",
      "data": [
        {
          "delay_type": "fixed",
           "delayPolicyRef": "/api/v2/delay-policy/objects/slow",
          "name": "slow",
          "milliseconds": "1000"
        },
        {
          "delay_type": "fixed_2",
           "delayPolicyRef": "/api/v2/delay-policy/objects/slow",
          "name": "slower",
          "milliseconds": "5000"
        }
        ]
      }

Get specific delay policy details
---------------------------------

-  **URL**: /api/v2/delay-policy/objects/
-  **Method**: GET
-  **Response codes**:
-  **200** - delay policy returned
-  **404** - delay policy not found
-  **Example output**:

.. code:: javascript

    {
      "version": "0.6.6",
      "data": [
        {
          "delay_type": "fixed",
          "delayPolicyRef": "/api/v2/delay-policy/objects/slow",
          "name": "slow",
          "milliseconds": "1000"
        }
      ]
    }

Add delay policy
----------------

Creates a delay policy. Returns 201 status code if successful or 409 if
request body options are wrong (type fixed provided with mean and stddev
options)

-  **URL**: /api/v2/delay-policy
-  **Method**: PUT
-  **Response codes**:
-  **201** - scenario list with details returned
-  **400** - bad request
-  **409** - wrong combination of options was used
-  **Example request body**:

   .. code:: javascript

       {
         "name": "delay_name",
         "delay_type": "fixed",
         "milliseconds": 50
       }

or:

.. code:: javascript

    {
      "name": "delay_name",
      "delay_type": "normalvariate",
      "mean": "mean_value",
      "stddev": "val"
    }

or:

.. code:: javascript

    {
      "name": "weighted_delay_name",
      "delay_type": "weighted",
     "delays": "fixed,30000,5:normalvariate,5000,1000,15:normalvariate,1000,500,70"}

-  **Example output**:

.. code:: javascript

    {
      "status_code": 201,
      "version": "0.6.6",
      "data":
      {
        "status": "new",
        "message": "Put Delay Policy Finished",
        "delay_type": "fixed",
        "delayPolicyRef": "/api/v2/delay-policy/objects/my_delay",
        "name": "my_delay"
      }
    }

Delete delay policy
-------------------

-  **URL**: /api/v2/delay-policy/objects/
-  **Method**: DELETE
-  **Response codes**:
-  **200** - delay policy deleted
-  **Example output**:

.. code:: javascript

    {
      "version": "0.6.6",
      "data":
      {
        "message": "Deleted 1 delay policies from [u'my_delay']"
      }
    }

Get records from tracker
------------------------

Gets records from tracker. Since this collection becomes quite big over
time - pagination is available. Your client application can define how
many records it wants to skip and current item limit. Mirage also
provides "href" - links to every record for additional information.

Available parameters: + limit - maximum records to return + skip - how
many records should be skipped + q - query. Query can be simple string
to search based on API call path, scenario. You can also supply values
to search for specific status codes and response times. For example I
would want to find a scenario named "my\_test\_suite\_x" and to see only
HTTP calls that produced status codes between 200 and 201, also, I would
want to see only those requests that took longer than 200 ms to
complete, my query would look like: "my\_test\_suite\_x sc:>=200
sc:<=201 rt:>200"

-  **URL**: /api/v2/tracker/records
-  **Method**: GET
-  **Response codes**:
-  **200** - list with tracker entries returned
-  **Example output**:

.. code:: javascript

    {
        "paging": {
            "last": "/api/v2/tracker/records?skip=23172&limit=2",
            "next": "/api/v2/tracker/records?skip=2&limit=2",
            "currentLimit": 2,
            "totalItems": 23174,
            "previous": null,
            "first": "/api/v2/tracker/records?skip=0&limit=2"
        },
        "data": [
            {
                "function": "/api/v2/scenarios/objects/localhost:scenario_100/stubs",
                "request_params": {},
                "start_time": "2015-10-27 11:18:24",
                "return_code": 200,
                "href": "/api/v2/tracker/records/objects/562f5d8137dd1220d73a0cbf",
                "duration_ms": 902,
                "stubo_response": "",
                "id": "562f5d8137dd1220d73a0cbf"
            },
            {
                "function": "/api/v2/scenarios/objects/localhost:scenario_14/action",
                "request_params": {},
                "scenario": "localhost:scenario_14",
                "start_time": "2015-10-27 10:15:01",
                "return_code": 200,
                "href": "/api/v2/tracker/records/objects/562f4ea537dd1220d73a0ca1",
                "duration_ms": 24,
                "stubo_response": "",
                "id": "562f4ea537dd1220d73a0ca1"
            }
        ]
    }

Get tracker record details
--------------------------

Gets detail information about specified tracker object ID.

-  **URL**: /api/v2/tracker/records/objects/
-  **Method**: GET
-  **Response codes**:
-  **200** - tracker record found, returned.
-  **404** - tracker record not found
-  **Example output**:

.. code:: javascript

    {
       "data":{
          "function":"/api/v2/scenarios/objects/localhost:scenario_100/stubs",
          "request_params":{

          },
          "tracking_level":"normal",
          "start_time":"2015-10-27 11:18:24",
          "return_code":200,
          "server":"karoliss-macbook-pro.local",
          "request_size":0,
          "response_headers":{
             "Date":"Tue, 27 Oct 2015 11:18:24 GMT",
             "Content-Length":"5835405",
             "Content-Type":"application/json; charset=UTF-8",
             "Server":"TornadoServer/4.1"
          },
          "request_headers":{
             "Accept-Language":"en-US,en;q=0.8,lt;q=0.6",
             "Accept-Encoding":"gzip, deflate, sdch",
             "Connection":"keep-alive",
             "Accept":"*/*",
             "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.71 Safari/537.36",
             "Dnt":"1",
             "Host":"localhost:8001",
             "X-Requested-With":"XMLHttpRequest",
             "Referer":"http://localhost:8001/manage/scenarios/details?scenario=/api/v2/scenarios/objects/localhost:scenario_100"
          },
          "host":"localhost",
          "request_method":"GET",
          "id":"562f5d8137dd1220d73a0cbf",
          "response_size":5835405,
          "duration_ms":902,
          "stubo_response":"",
          "port":"8001",
          "remote_ip":"::1"
       }
    }

