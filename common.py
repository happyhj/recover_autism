# -*- coding:utf-8 -*-
import time
from flask import g


### Easy Querying
def query_db(query, args=(), one=False):
    print query, args
    cur = g.db.execute(query, args)
    print cur
    rv = [dict((cur.description[idx][0], value)
               for idx, value in enumerate(row)) for row in cur.fetchall()]
    return (rv[0] if rv else None) if one else rv
    
# 현재 시각(년, 월, 일, 시, 분)을 startDate, endDate와 같은 형식으로 출력해주는 함수
# 예) 2013년 6월 1일 13시 15분 = 1306011315
def get10numberTimestamp():
	now = time.localtime()
	twoDigitYear = 0
	twoDigitMonth = 0
	twoDigitDay = 0
	twoDigitHour = 0
	twoDigitMinute = 0

	if (now.tm_year-2000) < 10 :
		twoDigitYear = '0'+str(now.tm_year-2000)
	elif (now.tm_year-2000) >= 10 :
		twoDigitYear = str(now.tm_year-2000)

	if (now.tm_mon) < 10 :
		twoDigitMonth = '0'+str(now.tm_mon)
	elif (now.tm_mon) >= 10 :
		twoDigitMonth = str(now.tm_mon)

	if (now.tm_mday) < 10 :
		twoDigitDay = '0'+str(now.tm_mday)
	elif (now.tm_mday) >= 10 :
		twoDigitDay = str(now.tm_mday)

	if (now.tm_hour) < 10 :
		twoDigitHour = '0'+str(now.tm_hour)
	elif (now.tm_hour) >= 10 :
		twoDigitHour = str(now.tm_hour)

	if (now.tm_min) < 10 :
		twoDigitMinute = '0'+str(now.tm_min)
	elif (now.tm_min) >= 10 :
		twoDigitMinute = str(now.tm_min)

	return int(str(twoDigitYear)+str(twoDigitMonth)+str(twoDigitDay)+str(twoDigitHour)+str(twoDigitMinute))