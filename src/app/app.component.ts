import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

interface Alert {
  longitude?: number
  latitude?: number
  code?: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  appState = 'assets/icons/online-red-icon.png'
  appStateLabel = "Inconnue"


  myRealMap: L.Map;

  private serverUrl = 'http://localhost:8080/socket'
  private title = 'WebSockets map live points';
  private stompClient;


  constructor() {
    //this.upToListen();
  }


  ngOnInit() {
    //https://www.openstreetmap.org/#map=12/5.36866/-3.9981
    this.myRealMap = L.map('myRealMap').setView([-3.9981, 5.36866], 12);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Map view Demo'
    }).addTo(this.myRealMap);

    let alert: Alert = {
      longitude: -3.9981,
      latitude: 5.36866,
      code: 1
    }

    this.addPoint(alert)

  }

  /**
   * Initialisation de la socket
   */
  upToListen() {
    let ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    let that = this;
    this.stompClient.connect(
      {},
      function (frame) {
        that.appStateLabel = "App connected"
        that.appState = 'assets/icons/online.png'
        that.stompClient.subscribe("/newpoint", (message) => {
          if (message.body) {

            console.log(message.body);
          }
        });
      },
      function (err) {
        that.appState = 'assets/icons/online-red-icon.png'
        that.appStateLabel = "Connected fail"
      });
  }


  /**
   * Ajouter une alerte sur la carte
   * @param {Alert} point
   */
  addPoint(point: Alert) {
    let myIcon;
    switch (point.code) {
      case 0:
        myIcon = L.icon({
          iconUrl: 'assets/icons/marker-icon-red.png'
        });
        break;
      case 1:
        myIcon = L.icon({
          iconUrl: 'assets/icons/marker-icon-orange.png'
        });
        break;
      case 2 :
        myIcon = L.icon({
          iconUrl: 'assets/icons/marker-icon.png'
        });
        break
      default :
        myIcon = L.icon({
          iconUrl: 'assets/icons/marker-icon.png'
        });
        break;
    }

    L.marker([point.latitude, point.longitude], {icon: myIcon})
      .bindPopup('Nouvelle alerte')
      .addTo(this.myRealMap).openPopup();

    this.myRealMap.setView([point.latitude, point.longitude], 12)
  }
}
