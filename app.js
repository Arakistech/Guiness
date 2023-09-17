/* global config csv2geojson turf Assembly $ */
'use strict';

mapboxgl.accessToken = config.accessToken;
const columnHeaders = config.sideBarInfo;
const iconMapping = config.iconMapping;

let geojsonData = {};
const filteredGeojson = {
  type: 'FeatureCollection',
  features: [],
};

const map = new mapboxgl.Map({
  container: 'map',
  style: config.style,
  projection: 'globe',
  center: config.center,
  zoom: config.zoom,
  pitch:config.pitch,
  bearing:config.bearing,
  transformRequest: transformRequest,
});

function flyToLocation(currentFeature) {
  map.flyTo({
    center: currentFeature,
    zoom: 16.5,
  });
}

function createPopup(currentFeature) {
  const popups = document.getElementsByClassName('mapboxgl-popup');
  /** Check if there is already a popup on the map and if so, remove it */
  if (popups[0]) popups[0].remove();
  new mapboxgl.Popup({ closeOnClick: true })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML('<h3>' + currentFeature.properties['Location Name'] + '</h3>')
    .addTo(map);
}

function buildLocationList(locationData) {
 
  /* Add a new listing section to the sidebar. */
  const listings = document.getElementById('listings');
  listings.innerHTML = '';
  locationData.features.forEach((location, i) => {
    const prop = location.properties;

    // prop.Location = JSON.parse(prop.Location);

    const listing = listings.appendChild(document.createElement('div'));
    /* Assign a unique `id` to the listing. */
    listing.id = 'listing-' + prop.id;

    /* Assign the `item` class to each listing for styling. */
    listing.className = 'item';

    /* Add the link to the individual listing created above. */
    const link = listing.appendChild(document.createElement('button'));
    link.className = 'title';
    link.id = 'link-' + prop.id;
    link.innerHTML =
      '<p style="line-height: 1.25">' + prop['Location Name'] + '</p>';

    /* Add details to the individual listing. */
    const details = listing.appendChild(document.createElement('div'));
    details.className = 'content';

    for (let i = 1; i < columnHeaders.length; i++) {
      const div = document.createElement('div');
      let val = prop[columnHeaders[i]];

      val = val ? val : '';

      div.innerHTML += val;
      div.className;
      details.appendChild(div);
    }

    link.addEventListener('click', function () {
      const clickedListing = location.geometry.coordinates;
      flyToLocation(clickedListing);
      createPopup(location);

      const activeItem = document.getElementsByClassName('active');
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

      const divList = document.querySelectorAll('.content');
      const divCount = divList.length;

      for (i = 0; i < divCount; i++) {
        divList[i].style.maxHeight = null;
      }

      for (let i = 0; i < geojsonData.features.length; i++) {
        this.parentNode.classList.remove('active');
        this.classList.toggle('active');
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      }
    });
  });
}

// Build dropdown list function
// title - the name or 'category' of the selection e.g. 'Languages: '
// defaultValue - the default option for the dropdown list
// listItems - the array of filter items

function buildDropDownList(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('h3');
  filterTitle.innerText = title;
  filterTitle.classList.add('py12', 'txt-bold');
  mainDiv.appendChild(filterTitle);

  const selectContainer = document.createElement('div');
  selectContainer.classList.add('select-container', 'center');

  const dropDown = document.createElement('select');
  dropDown.classList.add('select', 'filter-option');

  const selectArrow = document.createElement('div');
  selectArrow.classList.add('select-arrow');

  const firstOption = document.createElement('option');

  dropDown.appendChild(firstOption);
  selectContainer.appendChild(dropDown);
  selectContainer.appendChild(selectArrow);
  mainDiv.appendChild(selectContainer);

  for (let i = 0; i < listItems.length; i++) {
    const opt = listItems[i];
    const el1 = document.createElement('option');
    el1.textContent = opt;
    el1.value = opt;
    dropDown.appendChild(el1);
  }
  filtersDiv.appendChild(mainDiv);
}

// Build checkbox function
// title - the name or 'category' of the selection e.g. 'Languages: '
// listItems - the array of filter items
// To DO: Clean up code - for every third checkbox, create a div and append new checkboxes to it

function buildCheckbox(title, listItems) {
  const filtersDiv = document.getElementById('filters');
  const mainDiv = document.createElement('div');
  const filterTitle = document.createElement('div');
  const formatcontainer = document.createElement('div');
  filterTitle.classList.add('center', 'flex-parent', 'py12', 'txt-bold');
  formatcontainer.classList.add(
    'center',
    'flex-parent',
    'flex-parent--column',
    'px3',
    'flex-parent--space-between-main',
  );
  const secondLine = document.createElement('div');
  secondLine.classList.add(
    'center',
    'flex-parent',
    'py12',
    'px3',
    'flex-parent--space-between-main',
  );
  filterTitle.innerText = title;
  mainDiv.appendChild(filterTitle);
  mainDiv.appendChild(formatcontainer);

  for (let i = 0; i < listItems.length; i++) {
    const container = document.createElement('label');

    container.classList.add('checkbox-container');

    const input = document.createElement('input');
    input.classList.add('px12', 'filter-option');
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', listItems[i]);
    input.setAttribute('value', listItems[i]);

    const checkboxDiv = document.createElement('div');
    const inputValue = document.createElement('p');
    inputValue.innerText = listItems[i];
    checkboxDiv.classList.add('checkbox', 'mr6');
    checkboxDiv.appendChild(Assembly.createIcon('check'));

    container.appendChild(input);
    container.appendChild(checkboxDiv);
    container.appendChild(inputValue);

    formatcontainer.appendChild(container);
  }
  filtersDiv.appendChild(mainDiv);
}

const selectFilters = [];
const checkboxFilters = [];

function createFilterObject(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      checkboxFilters.push(keyValues);
    }
    if (filter.type === 'dropdown') {
      const keyValues = {};
      Object.assign(keyValues, {
        header: filter.columnHeader,
        value: filter.listItems,
      });
      selectFilters.push(keyValues);
    }
  });
}

function applyFilters() {
  const filterForm = document.getElementById('filters');

  filterForm.addEventListener('change', function () {
    const filterOptionHTML = this.getElementsByClassName('filter-option');
    const filterOption = [].slice.call(filterOptionHTML);

    const geojSelectFilters = [];
    const geojCheckboxFilters = [];

    filteredGeojson.features = [];
    // const filteredFeatures = [];
    // filteredGeojson.features = [];

    filterOption.forEach((filter) => {
      if (filter.type === 'checkbox' && filter.checked) {
        checkboxFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojCheckboxFilters.push(geojFilter);
            }
          });
        });
      }
      if (filter.type === 'select-one' && filter.value) {
        selectFilters.forEach((objs) => {
          Object.entries(objs).forEach(([, value]) => {
            if (value.includes(filter.value)) {
              const geojFilter = [objs.header, filter.value];
              geojSelectFilters.push(geojFilter);
            }
          });
        });
      }
    });

    if (geojCheckboxFilters.length === 0 && geojSelectFilters.length === 0) {
      geojsonData.features.forEach((feature) => {
        filteredGeojson.features.push(feature);
      });
    } else if (geojCheckboxFilters.length > 0) {
      geojCheckboxFilters.forEach((filter) => {
        geojsonData.features.forEach((feature) => {
          if (feature.properties[filter[0]].includes(filter[1])) {
            if (
              filteredGeojson.features.filter(
                (f) => f.properties.id === feature.properties.id,
              ).length === 0
            ) {
              filteredGeojson.features.push(feature);
            }
          }
        });
      });
      if (geojSelectFilters.length > 0) {
        const removeIds = [];
        filteredGeojson.features.forEach((feature) => {
          let selected = true;
          geojSelectFilters.forEach((filter) => {
            if (
              feature.properties[filter[0]].indexOf(filter[1]) < 0 &&
              selected === true
            ) {
              selected = false;
              removeIds.push(feature.properties.id);
            } else if (selected === false) {
              removeIds.push(feature.properties.id);
            }
          });
        });
        let uniqueRemoveIds = [...new Set(removeIds)];
        uniqueRemoveIds.forEach(function (id) {
          const idx = filteredGeojson.features.findIndex(
            (f) => f.properties.id === id,
          );
          filteredGeojson.features.splice(idx, 1);
        });
      }
    } else {
      geojsonData.features.forEach((feature) => {
        let selected = true;
        geojSelectFilters.forEach((filter) => {
          if (
            !feature.properties[filter[0]].includes(filter[1]) &&
            selected === true
          ) {
            selected = false;
          }
        });
        if (
          selected === true &&
          filteredGeojson.features.filter(
            (f) => f.properties.id === feature.properties.id,
          ).length === 0
        ) {
          filteredGeojson.features.push(feature);
        }
      });
    }

    map.getSource('locationData').setData(filteredGeojson);
    buildLocationList(filteredGeojson);
  });
}

function filters(filterSettings) {
  filterSettings.forEach((filter) => {
    if (filter.type === 'checkbox') {
      buildCheckbox(filter.title, filter.listItems);
    } else if (filter.type === 'dropdown') {
      buildDropDownList(filter.title, filter.listItems);
    }
  });
}

function removeFilters() {
  const input = document.getElementsByTagName('input');
  const select = document.getElementsByTagName('select');
  const selectOption = [].slice.call(select);
  const checkboxOption = [].slice.call(input);
  filteredGeojson.features = [];
  checkboxOption.forEach((checkbox) => {
    if (checkbox.type === 'checkbox' && checkbox.checked === true) {
      checkbox.checked = false;
    }
  });

  selectOption.forEach((option) => {
    option.selectedIndex = 0;
  });

  map.getSource('locationData').setData(geojsonData);
  buildLocationList(geojsonData);
}

function removeFiltersButton() {
  const removeFilter = document.getElementById('removeFilters');
  removeFilter.addEventListener('click', () => {
    removeFilters();
  });
}

createFilterObject(config.filters);
applyFilters();
filters(config.filters);
removeFiltersButton();

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: true, // Use the geocoder's default marker style
  zoom: 11,
});



function sortByDistance(selectedPoint) {
  const options = { units: 'miles' };
  let data;
  if (filteredGeojson.features.length > 0) {
    data = filteredGeojson;
  } else {
    data = geojsonData;
  }
  data.features.forEach((data) => {
    Object.defineProperty(data.properties, 'distance', {
      value: turf.distance(selectedPoint, data.geometry, options),
      writable: true,
      enumerable: true,
      configurable: true,
    });
  });

  data.features.sort((a, b) => {
    if (a.properties.distance > b.properties.distance) {
      return 1;
    }
    if (a.properties.distance < b.properties.distance) {
      return -1;
    }
    return 0; // a must be equal to b
  });
  const listings = document.getElementById('listings');
  while (listings.firstChild) {
    listings.removeChild(listings.firstChild);
  }
  buildLocationList(data);
}

geocoder.on('result', (ev) => {
  const searchResult = ev.result.geometry;
  sortByDistance(searchResult);
});

map.addControl(
  new MapboxDirections({
   accessToken: mapboxgl.accessToken
  }),
  'top-left'
);

map.on('load', () => {
  map.loadImage(
    './marker.png',
    (error, image) => {
    if (error) throw error;
     
    // Add the image to the map style.
    map.addImage('marker-image', image);
  });

  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
  map.addSource('locationData',  {
    type: 'geojson',
    data: {type:"FeatureCollection", "features":[]},
    generateId:true
  });

  // map.addLayer({
  //   id: 'locationData',
  //   type: 'circle',
  //   source:'locationData',
  //   layout:{
  //     visibility:'visible'
  //   },
  //   paint: {
  //     'circle-radius': 5, // size of circles
  //     'circle-color': '#3D2E5D', // color of circles
  //     'circle-stroke-color': 'white',
  //     'circle-stroke-width': 1,
  //     'circle-opacity': 1,
  //   },
  // });  
  
  map.addLayer({
    id: 'locationData',
    type: 'symbol',
    source:'locationData',
    layout:{
      visibility:'visible',
      'icon-allow-overlap':true,
      'icon-rotation-alignment':'viewport',
      'icon-image': 'marker-image', // reference the image
      'icon-size':0.025
    },
  });  

  // csv2geojson - following the Sheet Mapper tutorial https://www.mapbox.com/impact-tools/sheet-mapper
  console.log('loaded');
  function updateLocationOnMap(data) {
    geojsonData = data;
    map.getSource("locationData").setData(data); 
    buildLocationList(geojsonData);

    // data.features.map(dt => {
    //   console.log(dt);

    //   return new mapboxgl.Marker().setLngLat([...dt.geometry.coordinates]).addTo(map);
    // })
  }

  $(document).ready(() => {
    console.log('ready');
    $.ajax({
      type: 'GET',
      url: config.CSV,
      dataType: 'text',
      success: function (csvData) {
        makeGeoJSON(csvData, updateLocationOnMap);
       
      },
      error: function (request, status, error) {
        console.log(request);
        console.log(status);
        console.log(error);
      },
    });
  });

  // fetch('./Saved Places.json')
  // .then(res => res.json())
  // .then(data => {
  //   console.log(data);
  //   geojsonData = data;

  //   map.getSource("locationData").setData(data); 
  //   buildLocationList(geojsonData);
  // })
  // .catch(console.error);

  function makeGeoJSON(csvData, cb) {
    csv2geojson.csv2geojson(
      csvData,
      {
        latfield: 'Latitude',
        lonfield: 'Longitude',
        delimiter: ',',
      },
      (err, data) => {
        data.features.forEach((data, i) => {
          // data.geometry.coordinates.push(1);

          data.properties.id = i;
        });

        // geojsonData = data;
        // Add the the layer to the map
        cb(data);
      },
    );    
  }

  // map.on('render', (e) => {
  //   if(!map.isSourceLoaded('locationData')) { return; }

  //   updateMarkers();
  // });
  map.on('click', "locationData", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["locationData"],
    });

    // console.log(e.features[0]);

    const clickedPoint = features[0].geometry.coordinates;

    flyToLocation(clickedPoint);
    sortByDistance(clickedPoint);
    createPopup(features[0]);
  });

  map.on('mouseover', "locationData", () => {
    console.log("MouseOver");
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', "locationData", () => {
    map.getCanvas().style.cursor = '';
  });

  renderIcons();
  fireFilterListeners();

  // we can add Threebox to mapbox to add built-in mouseover/mouseout and click behaviors
  window.tb = new Threebox(
    map,
    map.getCanvas().getContext('webgl'),
    {
      defaultLights: true,
    }
  );

  var origin = [-6.287916098168898, 53.34537840389906, 0];

  map.addLayer({
    id: 'custom_layer',
    type: 'custom',
    renderingMode: '3d',
    onAdd: function (map, mbxContext) {

      // import soldier from an external glb file, scaling up its size 20x
      // IMPORTANT: .glb is not a standard MIME TYPE, you'll have to add it to your web server config,
      // otherwise you'll receive a 404 error

                // Attribution: Soldier animated model by T. Choonyung at https://www.mixamo.com
      // from https://www.mixamo.com/#/?page=1&query=vanguard&type=Character
      var options = {
        obj: config.glbFile,
        type: 'gltf',
        scale: 8,
        units: 'meters',
        rotation: { x: 90, y: 0, z: 0 }, //default rotation
        anchor: 'center'
      }

      tb.loadObj(options, function (model) {
        console.log("loaded");
        let soldier = model.setCoords(origin);
        tb.add(soldier);
      })

    },

    render: function (gl, matrix) {
      tb.update();
    }
  }, 'locationData');
});

function renderIcons() {
  let iconItems = config.icons.map(icon => {
    return `<div class="icon-filter-item" data-id="${icon}">
      <img src="./icons/${icon}.png" alt="" />
    </div>`;
  });


  document.getElementById("icons-filter").innerHTML = iconItems.join("");
}

let activeFilterIcon;
function fireFilterListeners() {
  document.querySelectorAll(".icon-filter-item").forEach(item => {
    item.onclick = (e) => {
      console.log(e);

      let features = [];
      if(activeFilterIcon == e.target) {
        // render all the place;
        features = geojsonData.features;

        e.target.classList.remove("active");
        activeFilterIcon = undefined;
      } else {

        let type = e.target.dataset.id;
        console.log(type);
        features = filterDataByType(type);

        if(activeFilterIcon) {activeFilterIcon.classList.remove("active");}
        e.target.classList.add("active");

        activeFilterIcon = e.target;
      }

      // console.log(features);
      let featureCollection = {"type":"FeatureCollection", "features":[...features]}
      map.getSource("locationData").setData(featureCollection);
      buildLocationList(featureCollection);
      
    };

  });
}

function filterDataByType(type) {
  let filteredData = geojsonData.features.filter(ft => ft.properties['Location Type'] == type);
  return filteredData;
}

const markers = {};
let markersOnScreen = {};
function updateMarkers() {
  const newMarkers = {};

  const features = map.querySourceFeatures('locationData');
  console.log(features);

  for (const feature of features) {
    const coords = feature.geometry.coordinates;
    const props = feature.properties;
    const id = feature.id;
     
    let marker = markers[id];

    if (!marker) {
      const el = createMarker(props);
      marker = markers[id] = new mapboxgl.Marker({
        element: el
      }).setLngLat(coords);
    }

    newMarkers[id] = marker;
     
    if (!markersOnScreen[id]) marker.addTo(map);
  }
    // for every marker we've added previously, remove those that are no longer visible
  for (const id in markersOnScreen) {
    if (!newMarkers[id]) markersOnScreen[id].remove();
  }

    markersOnScreen = newMarkers;
}

function createMarker(props) {  
  let icon = iconMapping[props.Type];

  let divMarker = document.createElement("div");
  divMarker.classList.add("div-marker");

  divMarker.innerHTML = `<img src="./icons/${icon}.png" alt=""/>`

  return divMarker;
}

// Modal - popup for filtering results
const filterResults = document.getElementById('filterResults');
const exitButton = document.getElementById('exitButton');
const modal = document.getElementById('modal');

filterResults.addEventListener('click', () => {
  modal.classList.remove('hide-visually');
  modal.classList.add('z5');
});

exitButton.addEventListener('click', () => {
  modal.classList.add('hide-visually');
});

const title = document.getElementById('title');
title.innerText = config.title;
const description = document.getElementById('description');
description.innerText = config.description;

function transformRequest(url) {
  const isMapboxRequest =
    url.slice(8, 22) === 'api.mapbox.com' ||
    url.slice(10, 26) === 'tiles.mapbox.com';
  return {
    url: isMapboxRequest ? url.replace('?', '?pluginName=finder&') : url,
  };
}
