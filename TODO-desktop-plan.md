This application is currently a mobile-first web application for mobile use when out of home. The description of the curent version is in TODO.md.
Please do not change the current version at all ! Do not get inspired by the current view.

I need a completely separate HTML version of the application that is designed for desktop use.
The puprose of it to have whole semester plan visibla at glance without scrolling.
The classes are happenning on the weekends only. Most of the time every 2 weeks, but there are exceptions. 

The new view should allow planning any holidays. i.e. I should know easily how many weeks of a break it is berween each "zjazd".
It can be similar to this one : long-term-plan-look.png

Please prepare this new view using the json data in plan.json.

New Requirements part 1:
 - there should be 2 versions. for group 1 and group 2. Swithcing by link at the top. desktop1.html and desktop2.html
 - try to squeeze it vertically more. ideally all fits into a single screen without scrolling. 

1. przerwa x dni. Should be left aligned and big bogger font.
2. Wpisz te daty w odpowiednim wierszu w którym jest długość przerwy
 
• Break 1 (28.02-01.03 → 14.03-15.03): 13 days - no holidays
• Break 2 (14.03-15.03 → 28.03-29.03): 13 days - no holidays  
• Break 3 (28.03-29.03 → 11.04-12.04): 13 days - 5-6 kwietnia Święta Wielkanocne
• Break 4 (11.04-12.04 → 25.04-26.04): 13 days - no holidays
• Break 5 (25.04-26.04 → 09.05-10.05): 13 days - 1-3 maja weekend majowy
• Break 6 (09.05-10.05 → 30.05-31.05): 20 days - 24 maja (czwartek) Zielone Świątki
• Break 7 (30.05-31.05 → 13.06-14.06): 13 days - 4 czerwca (czwartek) Boże Ciało