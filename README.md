# MapFit - Track Your Workouts

MapFit is a web app that allows you to log your running and cycling workouts on an interactive map. Users can track key stats like duration, distance, pace, speed, cadence and elevation gain. Workouts are saved to local browser storage so your workout history is never lost.

This project uses LeafletJS to display an OpenStreetMaps based map that you can click to add new workout markers. Custom workout classes store the workout data. Local browser storage with the Web Storage API handles persisting user data between sessions.

# Features:
 - Add running or cycling workouts by clicking on the map
 - Popup displays workout details like duration, distance and pace/speed
 - View all saved workouts in a list view with easy access to each workout's map location
 - Local storage saves workout data between sessions

# Tools / Tech Stack
- LeafletJS for map display and interaction
- Tailwind CSS for styling
- Web Storage API for local browser storage
- Custom OOP architecture with workout class hierarchy
- Parcel bundler

# Usage
- To add a workout:

Click on the map to bring up the entry form
Fill in the workout details (distance, time, cadence, etc)
Workout is saved to localStorage and displayed in list and on map

- To view past workouts:

Scroll the list of workouts on the left
Click a workout to move the map to its location
Customization
The workout class architecture makes it easy to add new workout types:

- Create a new Workout subclass
Override methods like calcPace() as needed
Adjust form to include new inputs
Handle in app class
