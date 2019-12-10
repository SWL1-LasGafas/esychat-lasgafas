// Speicherstruktur für die Nickname-Liste
export class Nickname {
    public name:string='';
    public enterdate:number=0; // Unix-Timestamp
    public active:boolean=false;
    public leavedate:number=0; // Voraussichtlich zur Zeit nicht benötigt
}
