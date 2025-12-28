@echo off
set OUT=data
set BASE=https://tomato.gg/_next/data/G493iqNOLDPa7uQwm3YF7/en

curl -s %BASE%"/meta-insights/EU.json?server=EU" -o ./%OUT%"/meta.json"

curl -s %BASE%"/tier-list.json?server=EU" -o %OUT%"/tier-list.json"

curl -s %BASE%"/economics/all/30.json?mode=all&days=30" -o %OUT%"/economics.json"

curl -s %BASE%"/tank-performance/recent/EU/30.json?mode=recent&server=EU&days=30" -o %OUT%"/performance.json"

curl -s %BASE%"/mastery/EU.json?server=EU" -o %OUT%"/mastery.json"

curl -s %BASE%"/moe/EU.json?server=EU" -o %OUT%"/moe.json"

curl -s %BASE%"/tanks.json" -o %OUT%"/tanks.json"

curl -s %BASE%"/tank-stats.json" -o %OUT%"/tank-stats.json"
  
echo OK.
pause
