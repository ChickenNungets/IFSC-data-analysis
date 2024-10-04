# Introduction

Competition Climbing is a new and exciting sport. Competitions vary wildly between one and another, with routesetters constantly introducing novel types of movement, recently emphasizing impressive parkour style coordination movement. With the additional component of high risk/randomness in the sport due to the nature of the format (e.g. only 4 minutes to attempt a boulder and only one attempt on a lead route), I wonder what kind of insights can be drawn from competition data with such a high level of variance.
# Data Collection

The data for this project was collected by scraping the International Federation of Sport Climbing (IFSC) API, which provides detailed information about athletes, competition events, and results. The scraping process is automated using Python, leveraging multithreading to efficiently handle multiple API requests and ensure complete data coverage across various endpoints. 

We can view the API calls used to retrive athlete and competition data by examining the Network tab in Chrome DevTools. You can view this in more detail in the scrape.py file. To ensure completeness, I implemented robust error handling to track any failed requests. For failed requests, the script will automatically retry the API call multiple times before moving on, ensuring a higher success rate.

# Data Cleaning/Validation
