baseUrl = 'https://covid19-brazil-api.now.sh'

var mymap = L.map('mapid').setView([0, 0], 1);

const attribution = '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
const tileURL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileURL, attribution)

tiles.addTo(mymap);

getData = async () => {
    const response = await fetch(baseUrl + '/api/report/v1')

    if (response.ok) {
        const data = await response.json()
        return data
    }

    alert('API ERROR: ' + response.status)
} 