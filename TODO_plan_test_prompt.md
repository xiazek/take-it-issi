# I need a unit test that will check if plan.json data is correct.

## The test file should be in  `src/plan.test.js`

## Sample cases to check by the test

All the times mentioned below in these test cases are in polish time. polish timezone should be also considered (see chapter below about polish timezone details).
i.e. when I mentione 12:15 it is 12:15 in polish timezone (CET or CEST depending on the date).
The tests currently are passing on my machine, but are failing on CI, as the timezone is different there. So please ensure that expectations are checked with correct timezone in mind.

- each day with classes has exactly 2 classes
- classes are only on weekends
- first class in a day starts at 9:00, finishes at 12:15
- second class in a day starts at 12:45 and finishes at 16:00
- all lectures are on saturdays
- all lectures are in room 2.41
- in march and april there are just lectures on Saturday. No single lab on saturday during these months
- on sundays we have only labs (no single class on sunday is a lecture)
- since may all classes are just labs - including these on saturday and sunday
- labs are only in either room "s. 3.27e" or "s. 3.27d"
- labs of group 1 and 2 are not happening in the same class at the same time.
- labs on Saturdays for group 1: the first is always in room "s. 3.27d" the second in "s. 3.27e"
- labs on Saturdays for group 2: the first is always in room "s. 3.27e" the second in "s. 3.27d"
- on Sundays until March 13th:
  - group 1 labs first class is in room "s. 3.27d" and group 2 in "s. 3.27e"
  - group 1 labs second class is in room "s. 3.27e" and group 2 in "s. 3.27d"
- on Sundays after March 14th:
  - group 1 labs first class is in room "s. 3.27e" and group 2 in "s. 3.27d"
  - group 1 labs second class is in room "s. 3.27d" and group 2 in "s. 3.27e"

## Ensure correct timezone in the tests is used  

Timezone Offsets:
 - Winter: UTC+1 (Standard Time)
 - Summer: UTC+2 (Daylight Saving Time

```csv
Event,Date,Change,Offset After
Spring Forward,"March 29, 2026",+1 Hour,UTC+2
Fall Back,"October 25, 2026",-1 Hour,UTC+1
```

# the unit tests from src/*.test.js should be part of CI build

Extend the workflow in .github to also run the unit tests files matching src/*.test.js as part of the CI build 