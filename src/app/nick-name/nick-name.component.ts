import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PersonService } from '../person.service';


@Component({
  selector: 'app-nick-name',
  templateUrl: './nick-name.component.html',
  styleUrls: ['./nick-name.component.css']
})
export class NickNameComponent implements OnInit {

  constructor(public pService: PersonService) { }

  ngOnInit() {
  }

  nickName: string = "";
  isOK: boolean = false;
  color: string;

  checkNickname(value: string): boolean {

    this.isOK = false;
    var regex = '^.*[a-zA-Z]+.*$';
    var notallowed = '[ ]';

    if (value.length >= 4) {
      console.log('Nick lang genug!');
      //if (value.match("^([a-z]|[A-Z]|[ä,ö,ü,Ä,Ö,Ü,ç,è,é,à])*$")) {
      if (value.length <= 10) {
        console.log('Nick nicht zu lang!');
        if (value.match(regex)) {
          console.log('Nick Regex OK!');
          if (value.search(notallowed) > 0) // Zweite Suche nach dem nicht erlaubten Zeichen, weil ein einzelnes Regex nicht so wirklich geklappt hat
          {
            console.log('Nick enthält ' + notallowed)
            this.isOK = false;
          }
          else {
            this.isOK = true;
          }
        }
        else {
          this.isOK = false;
        }
      }
        else {
          this.isOK = false;
        }
    }
    else {
      this.isOK = false;
    }

    return this.isOK;

  }

  @Output()
  nickNameChange = new EventEmitter<string>();

  setNickname() {
    this.nickName = this.nickName.trim();
    if (this.checkNickname(this.nickName)) {
      //if (this.pService.myNickname != this.nickName) { // Prüfung auf identischen Nick geht hier nicht, weil in main ein Fehler ausgegeben werden muss
        this.pService.myOldNickname = this.pService.myNickname;
        this.pService.myNickname = this.nickName;
        this.pService.nicknameColor = this.getRandomColor(); //sollte den Nickname farbig hinterlegen (Ist wohl veraltet und kann wieder weg. In chat-history gelöst mit CSS-Klassen)
        console.log("Nickname von " + this.pService.myOldNickname + ' nach ' + this.nickName);
        this.pService.nickInvalid = 0;
        console.log('emitting NickNameChange Event');
        this.nickNameChange.emit(this.nickName);
      //}
      //else {
      //  console.log("Nickname identisch!");
      //}
    }
    else {
      console.log("Nickname " + this.nickName + " ungültig!");
      //alert("Nickname ungültig. Bitte auch Buchstaben verwenden! Leerzeichen sind nicht erlaubt! Mindestens 4 Zeichen!"); // alert muss gemäs Story verschwinden.
      this.pService.nickInvalid = 1;
      console.log('emitting NickNameChange Event');
      this.nickNameChange.emit(this.nickName);
    }

  }

  // Diese Funktion und was damit zusammenhängt ist nicht mehr aktuell. Wird in chat-history gemanaged mit einem Array aus CSS-Klassen
  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

}

