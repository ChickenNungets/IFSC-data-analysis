import requests
import pandas as pd
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# Define the range of athlete IDs to scrape
start_id = 1  
end_id = 16460

# I took these headers from my own browser session
headers = {
    'X-Csrf-Token': 'QsiFWuxEY1S9h_-dQgRA_7S5w9uvvmXsjq56QbTPw4i_g_XR68rMCBFFhW6HngBRtHskfN5yjX8GQmawqs8BlQ',
    'Referer': 'https://ifsc.results.info',
    'Cookie': 'session_id=_verticallife_resultservice_session=6RHN3xZrXnftTiScNfSHg7BVvuebLzGAmC9P5vIpzdySn2vG7VwQpjSZRDHug%2BPKCWlkt831HjLvHsPoVKrzTGsPVR6mqSOtjHB%2Bwht%2Bj39KxYO%2FJlaU6zmh8VhNFEl9bXHiOlPGk8AxnZqiBSYKTxJFCqh34nqdurXfFDcsRnbEtYCixcOdx%2F32E4zYGLVw7DSXXIKOVTUivS43UJZq5zDWPctX95UWm%2FD7%2B6UYT2s0B%2B3XJVPgjMWCMR%2FVZs%2FQC45Gjm4uCpHHe8Yt73nM3J%2Br43V1HuHGSvRpRczrJ4QdovlJHDEpg4rjUA%3D%3D--xlV%2BnBWvX%2BFwNcXI--24wJLAwE%2F8YbvCRvH9nMWQ%3D%3D',  # If session cookies are required
}

# Function to fetch athlete data
def fetch_athlete_data(athlete_id):
    url = f"https://ifsc.results.info/api/v1/athletes/{athlete_id}"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            athlete_data = response.json()
            return {
                'athlete_id': athlete_data['id'],
                'firstname': athlete_data['firstname'],
                'lastname': athlete_data['lastname'],
                'age': athlete_data['age'],
                'gender': athlete_data['gender'],
                'country': athlete_data['country'],
                'height': athlete_data['height'],
                'arm_span': athlete_data['arm_span'],
                'paraclimbing_sport_class': athlete_data['paraclimbing_sport_class'],
            }
        else:
            return None  # Handle non-200 responses gracefully
    except Exception as e:
        print(f"Error fetching data for athlete ID {athlete_id}: {e}")
        return e


def fetch_athlete_results(athlete_id):
    url = f"https://ifsc.results.info/api/v1/athletes/{athlete_id}"
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            athlete_data = response.json()
            # Extract the athlete's results from the 'all_results' field
            results = []
            for result in athlete_data.get('all_results', []):
                results.append({
                    'athlete_id': athlete_id,
                    'rank': result['rank'],
                    'discipline': result['discipline'],
                    'season': result['season'],
                    'date': result['date'],
                    'event_id': result['event_id'],
                    'event_location': result['event_location']
                })
            return results
        else:
            return None  # Handle non-200 responses gracefully
    except Exception as e:
        print(f"Error fetching results for athlete ID {athlete_id}: {e}")
        return e

 
### Functions to retry data missed due to errors. They are mostly the same. ###

def retry_failed_athlete_info(failed_ids, max_retries=2, delay=2):
    retry_results = []
    for retry_count in range(max_retries):
        print(f"Retry attempt {retry_count + 1} for {len(failed_ids)} failed athlete IDs")
        retry_futures = []
        with ThreadPoolExecutor(max_workers=20) as executor:
            retry_futures = {executor.submit(fetch_athlete_data, athlete_id): athlete_id for athlete_id in failed_ids}
            failed_ids = []  # Reset failed_ids list for next retry
        
            for future in as_completed(retry_futures):
                athlete_data = future.result()
                athlete_id = retry_futures[future]

                if isinstance(athlete_data, Exception): # If an error occured during the fetch
                    failed_ids.append(athlete_id)
                elif athlete_data:
                    retry_results.append(athlete_data)
        
        if not failed_ids:
            break  # Exit loop if no more failed IDs
        
        time.sleep(delay)  # Wait between retries to avoid overloading the server
    
    if failed_ids:
        print(f"Final failed athlete IDs after {max_retries} retries: {failed_ids}")
    
    return retry_results, failed_ids


def retry_failed_athlete_results(failed_ids, max_retries=2, delay=2):
    retry_results = []
    for retry_count in range(max_retries):
        print(f"Retry attempt {retry_count + 1} for {len(failed_ids)} failed athlete IDs")
        retry_futures = []
        with ThreadPoolExecutor(max_workers=20) as executor:
            retry_futures = {executor.submit(fetch_athlete_results, athlete_id): athlete_id for athlete_id in failed_ids}
            failed_ids = []  # Reset failed_ids list for next retry
        
            for future in as_completed(retry_futures):
                results = future.result()
                athlete_id = retry_futures[future]

                if isinstance(results, Exception): # If an error occured during the fetch
                    failed_ids.append(athlete_id)
                elif results:
                    retry_results.extend(results)
        
        if not failed_ids:
            break  # Exit loop if no more failed IDs
        
        time.sleep(delay)  # Wait between retries to avoid overloading the server
    
    if failed_ids:
        print(f"Final failed athlete IDs after {max_retries} retries: {failed_ids}")
    
    return retry_results, failed_ids


def scrape_athletes_parallel(start_id, end_id, max_workers=100):
    athletes_info = []
    failed_ids = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit tasks for each athlete ID
        futures = {executor.submit(fetch_athlete_data, athlete_id): athlete_id for athlete_id in range(start_id, end_id + 1)}
        
        for future in as_completed(futures):
            athlete_data = future.result()
            athlete_id = futures[future]

            if isinstance(athlete_data, Exception):  # If an error occured during the fetch
                failed_ids.append(athlete_id)
            elif athlete_data:
                athletes_info.append(athlete_data)
    

    # Retry for failed athlete IDs
    if failed_ids:
        retry_results, failed_ids = retry_failed_athlete_info(failed_ids)
        athletes_info.extend(retry_results)  # Add successful retries

    return athletes_info, failed_ids


def scrape_athlete_results_parallel(start_id, end_id, max_workers=100):
    athlete_results = []
    failed_ids = []
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(fetch_athlete_results, athlete_id): athlete_id for athlete_id in range(start_id, end_id + 1)}
        
        for future in as_completed(futures):
            results = future.result()
            athlete_id = futures[future]
            if isinstance(results, Exception):  # If an error occured during the fetch
                failed_ids.append(athlete_id)
            elif results:
                athlete_results.extend(results)
            
    
    # Retry for failed athlete IDs
    if failed_ids:
        retry_results, failed_ids = retry_failed_athlete_results(failed_ids)
        athlete_results.extend(retry_results)  # Add successful retries
    
    return athlete_results, failed_ids



# Scrape athlete info data and store
athletes_info_list, failed_ids = scrape_athletes_parallel(start_id, end_id)
athletes_info_df = pd.DataFrame(athletes_info_list)

athletes_info_df.to_csv('athlete_information.csv', index=False)

print(f"Scraped {len(athletes_info_df)} athletes")
if failed_ids:
    print(f"Failed to fetch data for {len(failed_ids)} athlete IDs after retries: {failed_ids}")


# Scrape athlete results data and store
athlete_results_list, failed_ids = scrape_athlete_results_parallel(start_id, end_id)
athlete_results_df = pd.DataFrame(athlete_results_list)

athlete_results_df.to_csv('athlete_results.csv', index=False)

print(f"Scraped results for {len(athlete_results_df)} athlete events")
if failed_ids:
    print(f"Failed to fetch data for {len(failed_ids)} athlete IDs after retries: {failed_ids}")