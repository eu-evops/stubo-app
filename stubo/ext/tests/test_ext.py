import unittest
import datetime


class TestRollDate(unittest.TestCase):
    def _roll(self, source_date_str, recorded, delta, form=""):
        from stubo.ext import roll_date

        played = recorded + datetime.timedelta(delta)
        return roll_date(source_date_str, recorded, played, form)

#############################################################

    def test_yyyy_mm_dd(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05', recorded, 10)
        self.assertEqual('2014-01-15', result)

    def test_yyyy_mm_dd_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05', recorded, 10, "%Y-%m-%d")
        self.assertEqual('2014-01-15', result)

#############################################################

    def test_yyyy_dd_mm(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-05-01', recorded, 10)
        self.assertEqual('2014-05-11', result)

    def test_yyyy_dd_mm_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-05-01', recorded, 10, "%Y-%d-%m")
        self.assertEqual('2014-15-01', result)

#############################################################

    def test_yyyy_mm_dd_back(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05', recorded, -2)
        self.assertEqual('2014-01-03', result)

    def test_yyyy_mm_dd_back(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05', recorded, -2, "%Y-%m-%d")
        self.assertEqual('2014-01-03', result)

#############################################################

    def test_yyyy_mm_dd_t1(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05+00:00', recorded, 10)
        self.assertEqual('2014-01-15+00:00', result)

    def test_yyyy_mm_dd_t1_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05+00:00', recorded, 10, "%Y-%m-%d+%H:%M")
        self.assertEqual('2014-01-15+00:00', result)

#############################################################

    def test_yyyy_mm_dd_t2(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05T19:40:00+00:00', recorded, 10)
        self.assertEqual('2014-01-15T19:40:00+00:00', result)

    def test_yyyy_mm_dd_t2_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05T19:40:00+00:00', recorded, 10, "%Y-%m-%dT%H:%M:%S+00:00")
        self.assertEqual('2014-01-15T19:40:00+00:00', result)

#############################################################

    def test_yyyy_mm_dd_t3(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05 include me', recorded, 10)
        self.assertEqual('2014-01-15 include me', result)

    def test_yyyy_mm_dd_t3_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('2014-01-05 include me', recorded, 10, "%Y-%m-%d include me")
        self.assertEqual('2014-01-15 include me', result)

#############################################################

    def test_dd_mm_yyyy(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('05-01-2014', recorded, 10)
        self.assertEqual('05-11-2014', result)

    def test_dd_mm_yyyy_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('05-01-2014', recorded, 10, "%d-%m-%Y")
        self.assertEqual('15-01-2014', result)

#############################################################

    def test_yy_mm_dd(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('14-01-05', recorded, 10)
        self.assertEqual('14-01-05', result)

    def test_yy_mm_dd_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('14-01-05', recorded, 10, "%y-%m-%d")
        self.assertEqual('14-01-15', result)

#############################################################

    def test_MMMdd(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('JAN05', recorded, 10)
        self.assertEqual(result, 'JAN05')

    def test_MMMdd_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('Jan05', recorded, 10, "%b%d")
        self.assertEqual(result, 'Jan15')

#############################################################

    def test_ddMMM(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('05JAN', recorded, 10)
        self.assertEqual(result, '05JAN')

    def test_ddMMM_format(self):
        recorded = datetime.date(2014, 12, 10)
        result = self._roll('05Jan', recorded, 10, "%d%b")
        self.assertEqual(result, '15Jan')
