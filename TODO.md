Generate a responsive page for my university program. 

The goal is to have a page accessible mostly from mobile devices for all my coleegues in the program to access important information quickly.

This is a program where classes happen on weekends only, on average every 2 weeks.

# UI 

### 
1. Classes should be grouped together by "zjazdy" (i.e. weekends). i.e. "Zjazd 1: 12-13 March"
"sobota" or "niedziala" should be clearly marked
2. the past classes should be visually de-emphasized (i.e. greyed out) and if they exist, then the scroll should start at card with upcoming classes (at the top)
3. The space should be utilized well, so that fonts are big enough to be readable on mobile devices. There should not bee waste of space at the cost of readability.
   - currently the upcoming classes has a lot or real estate wasted. i.e. there is a frame inside frame on the sides and the hours space is relatively taking a lot of space. decreasint it should allow titles to be bigger and a bit bigger font.

### There should be two types of cards for each weekend (see below)

 - The view should be focused on "zjazdy" (weekends). So all classes during one weekend should be grouped together in one card. There is always just 4 classes per weekend (2 on saturday, 2 on sunday).

- each class UI elemtent should include:
   - time of the class (start end)
   - where is it happening (class name),
   - what is the CODE and the name of class. The long class name should be all visible. UI should be good for line-breaks too.  
   - the CODE should be in bold font. The class name as it is longer, should be smaller font and without bold.
   - the lecturer 
   - type of class (lecture/lab etc) should be presented after lecturer as "lab" or "wykład". both with different colors. We do not need the icon at the front of class name anymore 
- the classes that passed already should be shown as de-emphasized (i.e. greyed out)


For the upcoming closes zjazd weekend the card should be highlighted and additionally show:
 - how many days left until the start of that weekend (when tomorrow show "jutro" otherwise "za X dni"
   - when there is many days left, do not show hours/minutes, just days 

When classes are happening today (i.e. current day is saturday or sunday of a zjazd), then the view should focus on "logistics"
- the upcoming class should present counter with time left to start (i.e. "13 minut"), but also actual time of start and end (next to lecturer name)
- the current class should show counter with time left ("przerwa za 33 minuty) and also the time as above
- current and upcoming class should be highlighted visually
- the classes that passed should be de-emphasized (i.e. greyed out)


When the current day is not a class day, it should show:
- how long until the next class (i.e. in 3 days, 4 hours etc)
- the date of the next class
- the card for that uncomming zjadd should be prominent (similar or the same as the current day view)

Past weekends should be togglable (i.e. show/hide past weekends) with a button (as per above past classes are already de-emphasized anyway when shown)


# general

- Language should be polish (everyone is Polish speaker).
- the title should be "Take it ISSI"

# data
 - the plan is in the plan.json file. 
 - the classes names and lecturers and abbreviations are in subjects_mapping.json file.
 
# Technologies

 - the application in development should be accessible from localhost, but also when I typy full local IP address 192... etc
 - it needs to be responsive. feel free to use react.
 - it is a static site. the plan is not changing.
 - it should be possible to bookmark it with a group selected (i.e. I'm in group 2, I only care about this group schedule). So the url should be like /?group=2 (there is group 1 and 2)
 - Add a button anyone can use to create a shortcut for their screen on their mobile (including their group). 
   - this button should be possible to hide and save this in cookie, so it is hidden next time. (should be at the bottom, and it should be possible to show it again if done by mistake etc)
   - it should be titled "Dodaj skrót na pulpit telefonu"
   - There should be an icon saying ISSI with colors of AGH technical university logo. when someone creates a shourtcut, this icon should be used. It should also include readable "G1"
      -  the G1/G2 is currently in the corner. Move it to center and make it a bit bigger.
   - IMPORTANT: the link should include  the group number in the url, so that user saves it with HIS/HER group!. The instruction should mention that to user, so that they choose a group.
   - the banner should have less borders around and use more space for the icon. Icon should be bigger.