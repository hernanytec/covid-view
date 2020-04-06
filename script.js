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

let map = L.map('mapid').setView(BRASILIA_LOCATION, ZOOM_LEVEL)

function getColor(d) {
    if (d === 0)
        return '#00ED00'
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEAB3';
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

const fillTable = (data) => {

    let table = document.querySelector('table')

    for (let i = data.length - 1; i >= 0; i--) {
        let row = table.insertRow(1)

        let state = row.insertCell(0)
        let cases = row.insertCell(1)
        let suspects = row.insertCell(2)
        let deaths = row.insertCell(3)

        state.innerHTML = data[i].state
        cases.innerHTML = data[i].cases
        suspects.innerHTML = data[i].suspects
        deaths.innerHTML = data[i].deaths
    }

}

window.onload = async function () {
    const statesData = await getData(GEOJSON_URL)
    api_data = await getData(API_URL)
    api_data = api_data.data

    fillTable(api_data)

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
    try {
        data = getStatistics(props)
        this._div.innerHTML = '<h4>Quantidade de casos do COVID-19</h4> <br/>' + (props ?
            `
            <b>${data.state}:</b> 
            <ul>
                <li>
                    ${data.cases} casos confirmados
                </li>
                <li>
                    ${data.suspects} casos suspeitos 
                </li>
                <li>
                    ${data.deaths} mortes
                </li>
            </ul>
            `
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
    map.fitBounds(e.target.getBounds());
    highlightFeature(e)
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

