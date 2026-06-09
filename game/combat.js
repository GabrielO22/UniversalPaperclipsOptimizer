// game/combat.js — Headless port of Universal Paperclips combat.js
// Canvas rendering stripped entirely, only combat math kept

var battleNames = ["Aboukir", "Abensberg", "Acre", "Alba de Tormes", "la Albuera", "Algeciras Bay", "Amstetten", "Arcis-sur-Aube", "Aspern-Essling", "Jena-Auerstedt", "Arcole", "Austerlitz", "Badajoz", "Bailen", "la Barrosa", "Bassano", "Bautzen", "Berezina", "Bergisel", "Borodino", "Burgos", "Bucaco", "Cadiz", "Caldiero", "Castiglione", "Castlebar", "Champaubert", "Chateau-Thierry", "Copenhagen", "Corunna", "Craonne", "Dego", "Dennewitz", "Dresden", "Durenstein", "Eckmuhl", "Elchingen", "Espinosa de los Monteros", "Eylau", "Cape Finisterre", "Friedland", "Fuentes de Onoro", "Gevora River", "Gerona", "Hamburg", "Haslach-Jungingen", "Heilsberg", "Hohenlinden", "Jena-Auerstedt", "Kaihona", "Kolberg", "Landshut", "Leipzig", "Ligny", "Lodi", "Lubeck", "Lutzen", "Marengo", "Maria", "Medellin", "Medina de Rioseco", "Millesimo", "Mincio River", "Mondovi", "Montebello", "Montenotte", "Montmirail", "Mount Tabor", "The Nile", "Novi", "Ocana", "Cape Ortegal", "Orthez", "Pancorbo", "Piave River", "The Pyramids", "Quatre Bras", "Raab", "Raszyn", "Rivoli", "Rolica", "La Rothiere", "Rovereto", "Saalfeld", "Schongrabern", "Salamanca", "Smolensk", "Somosierra", "Talavera", "Tamames", "Trafalgar", "Trebbia", "Tudela", "Ulm", "Valls", "Valmaseda", "Valutino", "Vauchamps", "Vimeiro", "Vitoria", "Wagram", "Waterloo", "Wavre", "Wertingen", "Zaragoza"];

var battleNumbers = [];
for (var i = 0; i < battleNames.length; i++) {
    battleNumbers.push(1);
}

function generateBattleName() {
    var x = Math.floor(Math.random() * battleNames.length);
    var name = battleNames[x] + " " + battleNumbers[x];
    battleNumbers[x] = battleNumbers[x] + 1;
    return name;
}

function checkForBattles(s) {
    if (s.drifterCount > s.warTrigger && s.probeCount > 0 && s.battles.length < s.maxBattles) {
        var r = (Math.random() * 100);
        if (r >= 50) {
            if (s.battleFlag == 0) { s.battleFlag = 1; }
            createBattle(s);
        }
    }
}

function createBattle(s) {
    s.unitSize = 0;
    if (s.drifterCount >= s.probeCount) {
        s.unitSize = s.probeCount / 100;
    } else {
        s.unitSize = s.drifterCount / 100;
    }
    if (s.unitSize < 1) { s.unitSize = 1; }

    var rr = Math.random() * s.drifterCount;
    if (rr < 1) { rr = 1; }
    var ss = Math.random() * s.probeCount;
    if (ss < 1) { ss = 1; }
    var tt = Math.random() * s.availableMatter;

    s.battleID++;

    var newBattle = {
        id: s.battleID,
        clipProbes: ss,
        drifterProbes: rr,
        victory: false,
        loss: false,
        whiteFlag: 0,
        territory: tt,
        reportCount: 0,
        garbageFlag: 0,
    };

    s.battleName = s.battleNameFlag == 1 ? generateBattleName() : ("Drifter Attack " + newBattle.id);
    s.battles.push(newBattle);
}

function DoCombat(s) {
    var pX = s.probeCombat * s.probeCombatBaseRate;
    var dX = s.drifterCombat;

    for (var i = 0; i < s.battles.length; i++) {
        var r = Math.random();
        if (r >= s.battleSpeed) {
            var clipCasualties = s.battles[i].drifterProbes * dX * (1 - s.battleSpeed);
            if (clipCasualties > s.battles[i].clipProbes) { clipCasualties = s.battles[i].clipProbes; }
            s.battles[i].clipProbes = s.battles[i].clipProbes - clipCasualties;
            s.probeCount = s.probeCount - clipCasualties;
            s.probesLostCombat = s.probesLostCombat + clipCasualties;
        } else {
            var drifterCasualties = s.battles[i].clipProbes * Math.pow(pX, 1.7);
            if (drifterCasualties > s.battles[i].drifterProbes) { drifterCasualties = s.battles[i].drifterProbes; }
            s.battles[i].drifterProbes = s.battles[i].drifterProbes - drifterCasualties;
            s.drifterCount = s.drifterCount - drifterCasualties;
        }

        if (s.battles[i].drifterProbes < 1) { s.battles[i].victory = true; }
        if (s.battles[i].clipProbes < 1 && s.battles[i].victory == false) { s.battles[i].loss = true; }

        if (s.battles[i].loss == true && s.battles[i].whiteFlag == 0) {
            s.availableMatter = s.availableMatter - s.battles[i].territory;
            s.battles[i].whiteFlag = 1;
        }
    }
}

function checkForBattleEnd(s) {
    for (var i = s.battles.length - 1; i >= 0; i--) {
        if (s.battles[i].victory == true || s.battles[i].loss == true) {
            s.battles[i].reportCount++;

            if (s.battles[i].victory == true && s.battles[i].reportCount == 1) {
                var honorReward = s.battleRIGHTSHIPS + (s.bonusHonor || 0);
                s.honor = s.honor + honorReward;
                if (s.project134 && s.project134.flag == 1) {
                    s.bonusHonor = (s.bonusHonor || 0) + 10;
                }
            }

            if (s.battles[i].loss == true && s.battles[i].reportCount == 1) {
                s.honor = s.honor - s.battleLEFTSHIPS;
            }

            if (s.battles[i].reportCount > s.outcomeTimer) {
                s.battles.splice(i, 1);
                s.honorCount = 0;
            }
        }
    }
}

function war(s) {
    checkForBattles(s);
    DoCombat(s);
    checkForBattleEnd(s);
}

module.exports = {
    war,
    checkForBattles,
    createBattle,
    DoCombat,
    checkForBattleEnd,
    generateBattleName,
};