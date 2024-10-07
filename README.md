# Introduction

Competition Climbing is a new and exciting sport. Competitions vary wildly between one and another, with routesetters constantly introducing novel types of movement, recently emphasizing impressive parkour style coordination movement. With the additional component of high risk/randomness in the sport due to the nature of the format (e.g. only 4 minutes to attempt a boulder and only one attempt on a lead route), I wonder what kind of insights can be drawn from competition data with such a high level of variance.
# Data Collection

The data for this project was collected by scraping the International Federation of Sport Climbing (IFSC) API, which provides detailed information about athletes, competition events, and results. The scraping process is automated using Python, leveraging multithreading to efficiently handle multiple API requests. 

We can view the API calls used to retrive athlete and competition data by examining the Network tab in Chrome DevTools. You can view this in more detail in the gather.ipynb file. For failed requests, the script will automatically retry the API call multiple times before moving on to a higher success rate.

Data was collected in September 2024 and so will not reflect changes from competitions after that date.

# Data Cleaning/Validation

Once the raw data was collected, it went through a cleaning process. I utilized pandas for data wrangling to handle null values, data inconsistencies, and outliers. The cleaning process involved:

- Removing outlier athletes and competitions (no competitions with one participant, no athletes over 10 meters tall, etc.)
- Ensuring athletes can compete in a competition once.
- Competitions are created by aggregating competition records for individual athletes. I ensured that upon aggregation competition gender, time and discipline remained constant (interestingly there are 2 cases of a male competing in a female competition)
- Handling missing values by filling or dropping as needed.

# Data Analysis and Visualization

The goal of this project was to create an interactive bar chart race showing the top competition climbers and how their [Elo-MMR](https://github.com/EbTech/Elo-MMR/blob/master/paper/EloMMR.pdf) ratings evolved over time. See elo.ipynb for more details on Elo-MMR implementation. I used D3.js to create a dynamic visualization.

Key features:

- Filtering by gender and discipline (boulder, lead).
- Interactive controls for selecting time ranges and the number of athletes displayed.
- Smooth animations that dynamically update the chart as you explore the data over time.
- Additionally, I've implemented a play/pause feature that lets users automatically scroll through the timeline, providing a hands-free experience for visualizing trends.

The project is hosted using GitHub Pages for easy sharing and accessibility. You can check it out [here](https://chickennungets.github.io/IFSC-data-analysis/)!

# Future Work

This project was a fun dive into data visualization and applied data science. In the future, I would like to:

- Expand the data to include speed (which in its bracket tournament format lends itself to regular elo rankings) and combined boulder and lead Elo-MMR.
- Somehow integrate the variance of an athletes current ELO into the visualization, which is data I am not currently using.
- Integrate machine learning models to predict future Elo ratings based on past performance.
- Implement a full dashboard with more in-depth visualizations (e.g., scatter plots, line charts) for trend analysis.

If you’re a fellow climbing enthusiast or just into data science, feel free to fork the repo or reach out with suggestions for improvements!


