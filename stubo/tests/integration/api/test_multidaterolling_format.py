# -*- coding: utf-8 -*-
import json
import logging
from stubo.cache import Cache
from stubo.model.db import Tracker
from stubo.testing import Base

log = logging.getLogger(__name__)

class TestMultipleDateRollingFormat(Base):
    """
    Tests for multiple date rolling when format is YYYY:MM:DD
    """

    def _import_module(self):
        cache = Cache('localhost')
        _ = cache.set_stubo_setting("tracking_level", "full", True)
        self.http_client.fetch(self.get_url('/stubo/api/exec/cmds?cmdfile=/static/cmds/formatted_date/response.commands'),
                               self.stop)
        response = self.wait()
        self.assertEqual(response.code, 200)

    def test_multidate(self):
        # import from commands file
        self._import_module()

        self.http_client.fetch(self.get_url('/api/v2/tracker/records'), self.stop)
        response = self.wait()
        self.assertEqual(response.code, 200)
        json_body = json.loads(response.body)

        tracker_items = json_body['data']

        tracker = Tracker(self.db)

        for item in tracker_items:
            if item['function'] == 'get/response':
                record_id = item['id']
                obj = tracker.find_tracker_data_full(record_id)
                print obj['stubo_response']
                self.assertTrue('2014-11-06' in obj['stubo_response'])
                self.assertTrue('2014-10-06' in obj['stubo_response'])
                self.assertTrue('2014-08-06' in obj['stubo_response'])
