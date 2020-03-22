API_URL = 'https://covid19-brazil-api.now.sh/api/report/v1'
GEOJSON_URL = 'https://raw.githubusercontent.com/fititnt/gis-dataset-brasil/master/uf/geojson/uf.json'

BRASILIA_LOCATION = [-15.78, -47.93]
ZOOM_LEVEL = 4

let api_data = null
let geojson = null

getData = async URL => {
    return await fetch(URL).then(response => response.json())
}


getStatistics = feature => {
    return api_data.filter(state => state.uf == feature.UF_05)[0]
}

const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
const tileURL = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png'

let map = L.map('mapid').setView(BRASILIA_LOCATION, ZOOM_LEVEL)

const tiles = L.tileLayer(tileURL, attribution)

tiles.addTo(map)

function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEDA0';
}

function style(feature) {
    const data = getStatistics(feature.properties)

    return {
        fillColor: getColor(data.cases),
        weight: 1.5,
        opacity: 1,
        color: 'gray',
        dashArray: '3',
        fillOpacity: 1
    };
}

window.onload = async function () {
    const statesData = await getData(GEOJSON_URL)
    api_data = await getData(API_URL)
    api_data = api_data.data

    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    geojson.addTo(map);
}

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    //data = api_data.filter(state => state.uf == props.UF_05)[0]
    try {
        data = getStatistics(props)
        this._div.innerHTML = '<h4>Quantidade de casos do COVID-19</h4>' + (props ?
            '<b>' + data.state + '</b><br />' + data.cases + ' casos confirmados'
            : 'Passe o mouse sobre um estado');
    } catch (error) {

    }

};

info.addTo(map);

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);

    info.update();
}

function zoomToFeature(e) {
    console.log(e.target)
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

