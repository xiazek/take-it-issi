# I need a unit test that will check if plan.json data is correct.

The test file should be in  `src/plan.test.js`

Sample cases to check by the test:
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

