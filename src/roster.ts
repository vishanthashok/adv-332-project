import type { Player } from './data';

export const rosterSources = {
  lineups: 'https://www.uefa.com/uefachampionsleague/news/02aa-21dd60778d8f-1ea14fd92256-1000--champions-league-starting-line-ups-matchday-3/',
  matchday: 'https://www.skysports.com/football/paris-saint-germain-vs-barcelona/teams/577638',
  positions: 'https://en.as.com/resultados/futbol/champions/2026_2027/directo/regular_a_3_6a92d4a865c9a21/alineaciones/',
};

type Entry = [string, string, number, string];
const psgStarters: Entry[] = [
 ['safonov','Matvey Safonov',39,'Goalkeeper'],
 ['hakimi','Achraf Hakimi',2,'Right back'],
 ['marquinhos','Marquinhos',5,'Centre back'],
 ['pacho','Willian Pacho',51,'Centre back'],
 ['hernandez','Lucas Hernández',21,'Left back'],
 ['neves','João Neves',87,'Central midfield'],
 ['vitinha','Vitinha',17,'Central midfield'],
 ['ruiz','Fabián Ruiz',8,'Central midfield'],
 ['doue','Désiré Doué',14,'Right wing'],
 ['dembele','Ousmane Dembélé',10,'Striker'],
 ['kvaratskhelia','Khvicha Kvaratskhelia',7,'Left wing'],
];
const psgBench: Entry[] = [
 ['chevalier','Lucas Chevalier',30,'Goalkeeper'],['mouak','Adam Mouak',80,'Goalkeeper'],
 ['beraldo','Lucas Beraldo',4,'Centre back'],['torres','Ferran Torres',9,'Striker'],
 ['akliouche','Maghnes Akliouche',11,'Right wing'],['digne','Lucas Digne',12,'Left back'],
 ['godts','Mika Godts',22,'Left wing'],['mayulu','Senny Mayulu',24,'Central midfield'],
 ['fernandez','Dro Fernández',27,'Attacking midfield'],['zaire-emery','Warren Zaïre-Emery',33,'Central midfield'],
 ['ndjantou','Quentin Ndjantou',47,'Left wing'],['zabarnyi','Illia Zabarnyi',6,'Centre back'],
];
const barcaStarters: Entry[] = [
 ['garcia','Joan García',1,'Goalkeeper'],['espart','Xavi Espart',12,'Right back'],
 ['cubarsi','Pau Cubarsí',5,'Centre back'],['martin','Gerard Martín',18,'Centre back'],
 ['cancelo','João Cancelo',2,'Left back'],['bernal','Marc Bernal',22,'Defensive midfield'],
 ['pedri','Pedri',8,'Central midfield'],['yamal','Lamine Yamal',10,'Right wing'],
 ['olmo','Dani Olmo',20,'Attacking midfield'],['gordon','Anthony Gordon',17,'Left wing'],
 ['raphinha','Raphinha',11,'Striker'],
];
const barcaBench: Entry[] = [
 ['szczesny','Wojciech Szczęsny',13,'Goalkeeper'],['livakovic','Dominik Livaković',25,'Goalkeeper'],
 ['balde','Alejandro Balde',3,'Left back'],['farinas','Brian Fariñas',4,'Central midfield'],
 ['gavi','Gavi',6,'Central midfield'],['lopez','Fermín López',7,'Attacking midfield'],
 ['jesus','Gabriel Jesus',9,'Striker'],['adeyemi','Karim Adeyemi',14,'Left wing'],
 ['rodri','Rodri',16,'Defensive midfield'],['de-jong','Frenkie de Jong',21,'Central midfield'],
 ['abdelkarim','Hamza Abdelkarim',29,'Striker'],['campos','Àlex Campos',41,'Centre back'],
];

export function matchdayRoster(): Player[] {
 const make=(entries:Entry[],club:string,squadRole:'Starter'|'Bench')=>entries.map(([slug,name,number,position])=>({id:`${club==='PSG'?'psg':'barca'}-${slug}`,name,number,position,club,squadRole,goal:''}));
 return [...make(psgStarters,'PSG','Starter'),...make(psgBench,'PSG','Bench'),...make(barcaStarters,'Barcelona','Starter'),...make(barcaBench,'Barcelona','Bench')];
}

export const legacyRosterIds = new Set(['maya','jordan','alex','sam','riley','avery','leo','casey']);
export const clipPlayerIds: Record<string,string> = {
 'psg-1':'psg-hakimi', 'psg-2':'barca-raphinha', 'psg-3':'psg-doue',
 'psg-4':'psg-vitinha', 'psg-5':'psg-hernandez', 'psg-6':'psg-ruiz',
};
