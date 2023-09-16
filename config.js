'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/mapbox/streets-v12',
  accessToken:
    'pk.eyJ1IjoiaWFyYWtpc3RhaW4iLCJhIjoiY2xpYThhaTgxMDE0OTNsbzlydGs1MjNkYiJ9.8iGzdM2OVnC3NKpVatVGqA',
  CSV: './Wayfinding Locations_AM_20230913.csv',
  glbFile:'./src/factory.glb',
  center: [-6.289912423398846, 53.34437252133219],
  zoom: 17,
  pitch:57,
  bearing:60,
  title: 'Guiness Map',
  description:
    ' You can filter the list by business type.',
  sideBarInfo: ['Location Name', 'Detail', 'Location Type'],
  popupInfo: ['Location_Name'],
  icons:['Site Access', 'Logistics Area', 'Site Facilities', 'Fire Assembly Points'],
  // iconMapping: {
  //   'Library':'school',
  //   'Human Services/Non-profit (non-residential)':'Mall', 
  //   'Housing':'Gym', 
  //   'Government/Public Community Center':'Sports', 
  //   'Human Services/Non-profit (non-residential)Faith-based':'Park', 
  //   'Faith-based':'Supermarket', 
  //   'Justice Center':'Supermarket', 
  //   'Human Services/Non-profit (non-residential)K-12 Education':'Nursery', 
  //   'Human Services/Non-profit (non-residential)Other':'Mall'
  // },
  filters: [
    {
      type: 'dropdown',
      title: 'Languages supported: ',
      columnHeader: 'Languages',
      listItems: [
        'Amharic',
        'ASL',
        'Cambodian',
        'Chinese',
        'Danish',
        'English',
        'French',
        'German',
        'Greek',
        'Hindi',
        'Italian',
        'Japanese',
        'Korean',
        'Language Line Services',
        'Norwegian',
        'Oriya',
        'Portuguese',
        'Punjabi',
        'Russian',
        'Somali',
        'Spanish',
        'Swedish',
        'Tagalog',
        'Thai',
        'Tigrinya',
        'Tongan',
        'Vietnamese',
        'Ukranian',
      ],
    },
    {
      type: 'checkbox',
      title: 'Business type: ',
      columnHeader: 'Devices_available', // Case sensitive - must match spreadsheet entry
      listItems: ['Gym', 'Sport', 'Educational'], // Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
    },
    {
      type: 'dropdown',
      title: 'Clients: ',
      columnHeader: 'Clients',
      listItems: [
        'Adults',
        'Disabled',
        'Homeless',
        'Immigrants/Refugees',
        'Low Income',
        'Seniors',
        'Youth: Pre-teen',
        'Youth: Teen',
      ],
    },
  ],
};
