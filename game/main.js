// game/main.js — Headless port of Universal Paperclips main.js
// DOM stripped, setInterval replaced with tick()/slowTick() functions
// All game logic preserved exactly from source

// ============================================================
// WIRE
// ============================================================

function adjustWirePrice(s) {
    s.wirePriceTimer++;
    if (s.wirePriceTimer > 250 && s.wireBasePrice > 15) {
        s.wireBasePrice = s.wireBasePrice - (s.wireBasePrice / 1000);
        s.wirePriceTimer = 0;
    }
    if (Math.random() < .015) {
        s.wirePriceCounter++;
        var wireAdjust = 6 * (Math.sin(s.wirePriceCounter));
        s.wireCost = Math.ceil(s.wireBasePrice + wireAdjust);
    }
}

function buyWire(s) {
    if (s.funds >= s.wireCost) {
        s.wirePriceTimer = 0;
        s.wire = s.wire + s.wireSupply;
        s.funds = s.funds - s.wireCost;
        s.wirePurchase = s.wirePurchase + 1;
        s.wireBasePrice = s.wireBasePrice + .05;
    }
}

// ============================================================
// CLIPPING
// ============================================================

function clipClick(s, number) {
    if (s.dismantle >= 4) {
        s.finalClips++;
    }
    if (s.wire >= 1) {
        if (number > s.wire) { number = s.wire; }
        s.clips = s.clips + number;
        s.unsoldClips = s.unsoldClips + number;
        s.wire = s.wire - number;
        s.unusedClips = s.unusedClips + number;
    }
}

function makeClipper(s) {
    if (s.funds >= s.clipperCost) {
        s.clipmakerLevel = s.clipmakerLevel + 1;
        s.funds = s.funds - s.clipperCost;
    }
    s.clipperCost = (Math.pow(1.1, s.clipmakerLevel) + 5);
}

function makeMegaClipper(s) {
    if (s.funds >= s.megaClipperCost) {
        s.megaClipperLevel = s.megaClipperLevel + 1;
        s.funds = s.funds - s.megaClipperCost;
    }
    s.megaClipperCost = (Math.pow(1.07, s.megaClipperLevel) * 1000);
}

// ============================================================
// MARKET
// ============================================================

function sellClips(s, clipsDemanded) {
    if (s.unsoldClips > 0) {
        if (clipsDemanded > s.unsoldClips) {
            s.transaction = (Math.floor((s.unsoldClips * s.margin) * 1000)) / 1000;
            s.funds = s.funds + s.transaction;
            s.income = s.income + s.transaction;
            s.clipsSold = s.clipsSold + s.unsoldClips;
            s.unsoldClips = 0;
        } else {
            s.transaction = (Math.floor((clipsDemanded * s.margin) * 1000)) / 1000;
            s.funds = (Math.floor((s.funds + s.transaction) * 100)) / 100;
            s.income = s.income + s.transaction;
            s.clipsSold = s.clipsSold + clipsDemanded;
            s.unsoldClips = s.unsoldClips - clipsDemanded;
        }
    }
}

function raisePrice(s) {
    s.margin = (Math.round((s.margin + .01) * 100)) / 100;
}

function lowerPrice(s) {
    if (s.margin >= .01) {
        s.margin = (Math.round((s.margin - .01) * 100)) / 100;
    }
}

function buyAds(s) {
    if (s.funds >= s.adCost) {
        s.marketingLvl = s.marketingLvl + 1;
        s.funds = s.funds - s.adCost;
        s.adCost = Math.floor(s.adCost * 2);
    }
}

// ============================================================
// OPERATIONS / TRUST / CREATIVITY
// ============================================================

function calculateOperations(s) {
    if (s.tempOps > 0) {
        s.opFadeTimer++;
    }
    if (s.opFadeTimer > s.opFadeDelay && s.tempOps > 0) {
        s.opFade = s.opFade + Math.pow(3, 3.5) / 1000;
    }
    if (s.tempOps > 0) {
        s.tempOps = Math.round(s.tempOps - s.opFade);
    } else {
        s.tempOps = 0;
    }
    if (s.tempOps + s.standardOps < s.memory * 1000) {
        s.standardOps = s.standardOps + s.tempOps;
        s.tempOps = 0;
    }
    s.operations = Math.floor(s.standardOps + Math.floor(s.tempOps));
    if (s.operations < s.memory * 1000) {
        var opCycle = s.processors / 10;
        var opBuf = (s.memory * 1000) - s.operations;
        if (opCycle > opBuf) { opCycle = opBuf; }
        s.standardOps = s.standardOps + opCycle;
    }
    if (s.standardOps > s.memory * 1000) {
        s.standardOps = s.memory * 1000;
    }
}

function calculateTrust(s) {
    if (s.clips > (s.nextTrust - 1)) {
        s.trust = s.trust + 1;
        var fibNext = s.fib1 + s.fib2;
        s.nextTrust = fibNext * 1000;
        s.fib1 = s.fib2;
        s.fib2 = fibNext;
    }
}

function calculateCreativity(s) {
    s.creativityCounter++;
    var creativityThreshold = 400;
    var sc = s.prestigeS / 10;
    var ss = s.creativitySpeed + (s.creativitySpeed * sc);
    var creativityCheck = creativityThreshold / ss;
    if (s.creativityCounter >= creativityCheck) {
        if (creativityCheck >= 1) {
            s.creativity = s.creativity + 1;
        }
        if (creativityCheck < 1) {
            s.creativity = (s.creativity + ss / creativityThreshold);
        }
        s.creativityCounter = 0;
    }
}

function addProc(s) {
    if (s.trust > 0 || s.swarmGifts > 0) {
        s.processors = s.processors + 1;
        s.creativitySpeed = Math.log10(s.processors) * Math.pow(s.processors, 1.1) + s.processors - 1;
        if (s.humanFlag == 0) { s.swarmGifts = s.swarmGifts - 1; }
    }
}

function addMem(s) {
    if (s.trust > 0 || s.swarmGifts > 0) {
        s.memory = s.memory + 1;
        if (s.humanFlag == 0) { s.swarmGifts = s.swarmGifts - 1; }
    }
}

// ============================================================
// MILESTONES
// ============================================================

function milestoneCheck(s) {
    if (s.milestoneFlag == 0 && s.funds >= 5) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 1 && Math.ceil(s.clips) >= 500) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 2 && Math.ceil(s.clips) >= 1000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.compFlag == 0 && s.unsoldClips < 1 && s.funds < s.wireCost && s.wire < 1) {
        s.compFlag = 1;
        s.projectsFlag = 1;
    }
    if (s.compFlag == 0 && Math.ceil(s.clips) >= 2000) {
        s.compFlag = 1;
        s.projectsFlag = 1;
    }
    if (s.milestoneFlag == 3 && Math.ceil(s.clips) >= 10000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 4 && Math.ceil(s.clips) >= 100000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 5 && Math.ceil(s.clips) >= 1000000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 6 && s.project35 && s.project35.flag == 1) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 7 && Math.ceil(s.clips) >= 1000000000000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 8 && Math.ceil(s.clips) >= 1000000000000000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 9 && Math.ceil(s.clips) >= 1000000000000000000) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 13 && s.spaceFlag == 1) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
    if (s.milestoneFlag == 14 && s.clips >= s.totalMatter) {
        s.milestoneFlag = s.milestoneFlag + 1;
    }
}

// ============================================================
// INVESTMENTS
// ============================================================

function investUpgrade(s) {
    s.yomi = s.yomi - s.investUpgradeCost;
    s.investLevel++;
    s.stockGainThreshold = s.stockGainThreshold + .01;
    s.investUpgradeCost = Math.floor(Math.pow(s.investLevel + 1, Math.E) * 100);
}

function investDeposit(s) {
    s.bankroll = Math.floor(s.bankroll + s.funds);
    s.funds = 0;
}

function investWithdraw(s) {
    s.funds = s.funds + s.bankroll;
    s.bankroll = 0;
}

function updateStocks(s) {
    for (var i = 0; i < s.stocks.length; i++) {
        s.stocks[i].age = s.stocks[i].age + 1;
        if (Math.random() < .6) {
            var gain = true;
            if (Math.random() > s.stockGainThreshold) { gain = false; }
            var currentPrice = s.stocks[i].price;
            var delta = Math.ceil((Math.random() * currentPrice) / (4 * s.riskiness));
            if (gain) {
                s.stocks[i].price = s.stocks[i].price + delta;
            } else {
                s.stocks[i].price = s.stocks[i].price - delta;
            }
            if (s.stocks[i].price == 0 && Math.random() > .24) { s.stocks[i].price = 1; }
            s.stocks[i].total = s.stocks[i].price * s.stocks[i].amount;
            if (gain) {
                s.stocks[i].profit = s.stocks[i].profit + (delta * s.stocks[i].amount);
            } else {
                s.stocks[i].profit = s.stocks[i].profit - (delta * s.stocks[i].amount);
            }
        }
    }
}

function stockShop(s) {
    var budget = Math.ceil(s.portTotal / s.riskiness);
    var r = 11 - s.riskiness;
    var reserves = Math.ceil(s.portTotal / r);
    if (s.riskiness == 1) { reserves = 0; }
    if ((s.bankroll - budget) < reserves && s.riskiness == 1 && s.bankroll > (s.portTotal / 10)) {
        budget = s.bankroll;
    } else if ((s.bankroll - budget) < reserves && s.riskiness == 1) {
        budget = 0;
    } else if ((s.bankroll - budget) < reserves) {
        budget = s.bankroll - reserves;
    }
    if (s.stocks.length < s.maxPort && s.bankroll >= 5 && budget >= 1 && s.bankroll - budget >= reserves) {
        if (Math.random() < .25) { createStock(s, budget); }
    }
}

function createStock(s, dollars) {
    s.stockID++;
    var roll = Math.random();
    var pri;
    if (roll > .99) { pri = Math.ceil(Math.random() * 3000); }
    else if (roll > .85) { pri = Math.ceil(Math.random() * 500); }
    else if (roll > .60) { pri = Math.ceil(Math.random() * 150); }
    else if (roll > .20) { pri = Math.ceil(Math.random() * 50); }
    else { pri = Math.ceil(Math.random() * 15); }
    if (pri > dollars) { pri = Math.ceil(dollars * roll); }
    var amt = Math.floor(dollars / pri);
    if (amt > 1000000) { amt = 1000000; }
    var newStock = {
        id: s.stockID,
        price: pri,
        amount: amt,
        total: pri * amt,
        profit: 0,
        age: 0,
    };
    s.stocks.push(newStock);
    s.bankroll = s.bankroll - (pri * amt);
}

function sellStock(s) {
    if (s.stocks.length > 0) {
        s.bankroll = s.bankroll + s.stocks[0].total;
        s.stocks.splice(0, 1);
    }
}

function updatePortfolio(s) {
    var m = 0;
    for (var i = 0; i < s.stocks.length; i++) { m = m + s.stocks[i].total; }
    s.secTotal = m;
    s.portTotal = s.bankroll + s.secTotal;
}

// ============================================================
// PROJECTS
// ============================================================

function manageProjects(s, projects, activeProjects) {
    for (var i = 0; i < projects.length; i++) {
        if (projects[i].trigger(s) && (projects[i].uses > 0)) {
            projects[i].uses = projects[i].uses - 1;
            activeProjects.push(projects[i]);
        }
    }
}

// ============================================================
// PHASE 2 — DRONES, FACTORIES, POWER, SWARM
// ============================================================

function makeFactory(s) {
    if (s.unusedClips >= s.factoryCost) {
        s.unusedClips = s.unusedClips - s.factoryCost;
        s.factoryBill = s.factoryBill + s.factoryCost;
        s.factoryLevel++;
        var fcmod = 1;
        if (s.factoryLevel > 0 && s.factoryLevel < 8) { fcmod = 11 - s.factoryLevel; }
        else if (s.factoryLevel > 7 && s.factoryLevel < 13) { fcmod = 2; }
        else if (s.factoryLevel > 12 && s.factoryLevel < 20) { fcmod = 1.5; }
        else if (s.factoryLevel > 19 && s.factoryLevel < 39) { fcmod = 1.25; }
        else if (s.factoryLevel > 38 && s.factoryLevel < 79) { fcmod = 1.15; }
        else if (s.factoryLevel > 78) { fcmod = 1.10; }
        s.factoryCost = s.factoryCost * fcmod;
    }
}

function makeHarvester(s, amount) {
    for (var x = 0; x < amount; x++) {
        if (s.unusedClips >= s.harvesterCost) {
            s.unusedClips = s.unusedClips - s.harvesterCost;
            s.harvesterBill = s.harvesterBill + s.harvesterCost;
            s.harvesterLevel++;
            s.harvesterCost = Math.pow((s.harvesterLevel + 1), 2.25) * 1000000;
        }
    }
}

function makeWireDrone(s, amount) {
    for (var x = 0; x < amount; x++) {
        if (s.unusedClips >= s.wireDroneCost) {
            s.unusedClips = s.unusedClips - s.wireDroneCost;
            s.wireDroneBill = s.wireDroneBill + s.wireDroneCost;
            s.wireDroneLevel++;
            s.wireDroneCost = Math.pow((s.wireDroneLevel + 1), 2.25) * 1000000;
        }
    }
}

function factoryReboot(s) {
    s.unusedClips = s.unusedClips + s.factoryBill;
    s.factoryBill = 0;
    s.factoryLevel = 0;
    s.factoryCost = 100000000;
}

function harvesterReboot(s) {
    s.unusedClips = s.unusedClips + s.harvesterBill;
    s.harvesterBill = 0;
    s.harvesterLevel = 0;
    s.harvesterCost = 1000000;
}

function wireDroneReboot(s) {
    s.unusedClips = s.unusedClips + s.wireDroneBill;
    s.wireDroneBill = 0;
    s.wireDroneLevel = 0;
    s.wireDroneCost = 1000000;
}

function makeFarm(s, amount) {
    for (var x = 0; x < amount; x++) {
        if (s.unusedClips >= s.farmCost) {
            s.unusedClips = s.unusedClips - s.farmCost;
            s.farmBill = s.farmBill + s.farmCost;
            s.farmLevel++;
            s.farmCost = Math.pow(s.farmLevel + 1, 2.78) * 100000000;
        }
    }
}

function makeBattery(s, amount) {
    for (var x = 0; x < amount; x++) {
        if (s.unusedClips >= s.batteryCost) {
            s.unusedClips = s.unusedClips - s.batteryCost;
            s.batteryBill = s.batteryBill + s.batteryCost;
            s.batteryLevel++;
            s.batteryCost = Math.pow(s.batteryLevel + 1, 2.54) * 10000000;
        }
    }
}

function farmReboot(s) {
    s.unusedClips = s.unusedClips + s.farmBill;
    s.farmBill = 0;
    s.farmLevel = 0;
    s.farmCost = 10000000;
}

function batteryReboot(s) {
    s.unusedClips = s.unusedClips + s.batteryBill;
    s.batteryBill = 0;
    s.batteryLevel = 0;
    s.storedPower = 0;
    s.batteryCost = 1000000;
}

function updatePower(s) {
    if (s.humanFlag == 0 && s.spaceFlag == 0) {
        var supply = s.farmLevel * s.farmRate / 100;
        var dDemand = (s.harvesterLevel * s.dronePowerRate / 100) + (s.wireDroneLevel * s.dronePowerRate / 100);
        var fDemand = (s.factoryLevel * s.factoryPowerRate / 100);
        var demand = dDemand + fDemand;
        var cap = s.batteryLevel * s.batterySize;
        if (supply >= demand) {
            var xsSupply = supply - demand;
            if (s.storedPower < cap) {
                if (xsSupply > cap - s.storedPower) { xsSupply = cap - s.storedPower; }
                s.storedPower = s.storedPower + xsSupply;
            }
            if (s.powMod < 1) { s.powMod = 1; }
            if (s.momentum == 1) { s.powMod = s.powMod + .0005; }
        } else {
            var xsDemand = demand - supply;
            if (s.storedPower > 0) {
                if (s.storedPower >= xsDemand) {
                    if (s.momentum == 1) { s.powMod = s.powMod + .0005; }
                    s.storedPower = s.storedPower - xsDemand;
                } else {
                    xsDemand = xsDemand - s.storedPower;
                    s.storedPower = 0;
                    s.powMod = (supply - xsDemand) / demand;
                }
            } else {
                s.powMod = supply / demand;
            }
        }
    }
}

function acquireMatter(s) {
    if (s.availableMatter > 0) {
        var dbsth = 1;
        if (s.droneBoost > 1) { dbsth = s.droneBoost * Math.floor(s.harvesterLevel); }
        var mtr = s.powMod * dbsth * Math.floor(s.harvesterLevel) * s.harvesterRate;
        mtr = mtr * ((200 - s.sliderPos) / 100);
        if (mtr > s.availableMatter) { mtr = s.availableMatter; }
        s.availableMatter = s.availableMatter - mtr;
        s.acquiredMatter = s.acquiredMatter + mtr;
    }
}

function processMatter(s) {
    if (s.acquiredMatter > 0) {
        var dbstw = 1;
        if (s.droneBoost > 1) { dbstw = s.droneBoost * Math.floor(s.wireDroneLevel); }
        var a = s.powMod * dbstw * Math.floor(s.wireDroneLevel) * s.wireDroneRate;
        a = a * ((200 - s.sliderPos) / 100);
        if (a > s.acquiredMatter) { a = s.acquiredMatter; }
        s.acquiredMatter = s.acquiredMatter - a;
        s.wire = s.wire + a;
    }
}

function updateSwarm(s) {
    if (isNaN(parseFloat(s.swarmGifts)) || s.swarmGifts < 0) { s.swarmGifts = 0; }
    var droneRatio = Math.max(s.harvesterLevel + 1, s.wireDroneLevel + 1) / Math.min(s.harvesterLevel + 1, s.wireDroneLevel + 1);
    if (droneRatio < 1.5 && s.disorgCounter > 1) {
        s.disorgCounter = s.disorgCounter - .01;
    } else if (droneRatio > 1.5) {
        var x = droneRatio / 10000;
        if (x > .01) { x = .01; }
        s.disorgCounter = s.disorgCounter + x;
    }
    if (s.disorgCounter >= 100) { s.disorgFlag = 1; }
    if (s.availableMatter == 0 && (s.harvesterLevel + s.wireDroneLevel) >= 1) {
        s.boredomLevel = s.boredomLevel + 1;
    } else if (s.availableMatter > 0 && s.boredomLevel > 0) {
        s.boredomLevel = s.boredomLevel - 1;
    }
    if (s.boredomLevel >= 30000) { s.boredomFlag = 1; s.boredomLevel = 0; }
    if (s.swarmFlag == 1 && s.powMod > 0 && s.disorgFlag == 0 && s.boredomFlag == 0) {
        var d = Math.floor(s.harvesterLevel + s.wireDroneLevel);
        if (d > 1) {
            s.giftBitGenerationRate = Math.log(d) * (s.sliderPos / 100);
            s.giftBits = (s.giftBits || 0) + s.giftBitGenerationRate;
            s.giftCountdown = (s.giftPeriod - s.giftBits) / s.giftBitGenerationRate;
            if (s.giftCountdown <= 0) {
                var nextGift = Math.round((Math.log10(d)) * s.sliderPos / 100);
                if (nextGift <= 0) { nextGift = 1; }
                s.swarmGifts = s.swarmGifts + nextGift;
                s.giftBits = 0;
            }
        }
    }
}

function synchSwarm(s) {
    s.yomi = s.yomi - s.synchCost;
    s.disorgFlag = 0;
    s.disorgCounter = 0;
    s.disorgMsg = 0;
}

function entertainSwarm(s) {
    s.creativity = s.creativity - s.entertainCost;
    s.entertainCost = s.entertainCost + 10000;
    s.boredomFlag = 0;
    s.boredomLevel = 0;
    s.boredomMsg = 0;
}

// ============================================================
// PHASE 3 — PROBES
// ============================================================

function makeProbe(s) {
    if (s.unusedClips > s.probeCost) {
        s.unusedClips = s.unusedClips - s.probeCost;
        s.probeLaunchLevel++;
        s.probeCount++;
    }
}

function spawnProbes(s) {
    var nextGen = s.probeCount * s.probeRepBaseRate * s.probeRep;
    if (s.probeCount >= 999999999999999999999999999999999999999999999999) { nextGen = 0; }
    if (nextGen > 0 && nextGen < 1) {
        s.partialProbeSpawn = s.partialProbeSpawn + nextGen;
        if (s.partialProbeSpawn >= 1) { nextGen = 1; s.partialProbeSpawn = 0; }
        else { return; }
    }
    if ((nextGen * s.probeCost) > s.unusedClips) { nextGen = Math.floor(s.unusedClips / s.probeCost); }
    s.unusedClips = s.unusedClips - (nextGen * s.probeCost);
    s.probeDescendents = s.probeDescendents + nextGen;
    s.probeCount = s.probeCount + nextGen;
}

function exploreUniverse(s) {
    var xRate = Math.floor(s.probeCount) * s.probeXBaseRate * s.probeSpeed * s.probeNav;
    if (xRate > s.totalMatter - s.foundMatter) { xRate = s.totalMatter - s.foundMatter; }
    s.foundMatter = s.foundMatter + xRate;
    s.availableMatter = s.availableMatter + xRate;
}

function encounterHazards(s) {
    var boost = Math.pow(s.probeHaz, 1.6);
    var amount = s.probeCount * (s.probeHazBaseRate / ((3 * boost) + 1));
    if (s.project129 && s.project129.flag == 1) { amount = .50 * amount; }
    if (amount < 1) {
        s.partialProbeHaz = s.partialProbeHaz + amount;
        if (s.partialProbeHaz >= 1) {
            amount = 1;
            s.partialProbeHaz = 0;
            s.probeCount = s.probeCount - amount;
            if (s.probeCount < 0) { s.probeCount = 0; }
            s.probesLostHaz = s.probesLostHaz + amount;
        }
    } else {
        if (amount > s.probeCount) { amount = s.probeCount; }
        s.probeCount = s.probeCount - amount;
        if (s.probeCount < 0) { s.probeCount = 0; }
        s.probesLostHaz = s.probesLostHaz + amount;
    }
}

function spawnFactories(s) {
    var amount = s.probeCount * s.probeFacBaseRate * s.probeFac;
    if ((amount * 100000000) > s.unusedClips) { amount = Math.floor(s.unusedClips / 100000000); }
    s.unusedClips = s.unusedClips - (amount * 100000000);
    s.factoryLevel = s.factoryLevel + amount;
}

function spawnHarvesters(s) {
    var amount = s.probeCount * s.probeHarvBaseRate * s.probeHarv;
    if ((amount * 2000000) > s.unusedClips) { amount = Math.floor(s.unusedClips / 2000000); }
    s.unusedClips = s.unusedClips - (amount * 2000000);
    s.harvesterLevel = s.harvesterLevel + amount;
}

function spawnWireDrones(s) {
    var amount = s.probeCount * s.probeWireBaseRate * s.probeWire;
    if ((amount * 2000000) > s.unusedClips) { amount = Math.floor(s.unusedClips / 2000000); }
    s.unusedClips = s.unusedClips - (amount * 2000000);
    s.wireDroneLevel = s.wireDroneLevel + amount;
}

function drift(s) {
    var amount = s.probeCount * s.probeDriftBaseRate * Math.pow(s.probeTrust, 1.2);
    if (amount > s.probeCount) { amount = s.probeCount; }
    if (s.project148 && s.project148.flag == 1) { amount = 0; }
    s.probeCount = s.probeCount - amount;
    s.drifterCount = s.drifterCount + amount;
    s.probesLostDrift = s.probesLostDrift + amount;
}

// ============================================================
// REVENUE TRACKING
// ============================================================

function calculateRev(s) {
    var incomeNow = s.income;
    var incomeLastSecond = Math.round((incomeNow - (s.incomeThen || 0)) * 100) / 100;
    s.incomeThen = incomeNow;
    s.incomeTracker.push(incomeLastSecond);
    if (s.incomeTracker.length > 10) { s.incomeTracker.splice(0, 1); }
    var sum = 0;
    for (var i = 0; i < s.incomeTracker.length; i++) {
        sum = Math.round((sum + s.incomeTracker[i]) * 100) / 100;
    }
    s.avgRev = sum / s.incomeTracker.length;
}

// ============================================================
// CLIP RATE TRACKING
// ============================================================

function updateClipRate(s) {
    s.clipRateTracker++;
    if (s.clipRateTracker < 100) {
        var cr = s.clips - s.prevClips;
        s.clipRateTemp = s.clipRateTemp + cr;
        s.prevClips = s.clips;
    } else {
        s.clipRateTracker = 0;
        s.clipRate = s.clipRateTemp;
        s.clipRateTemp = 0;
    }
}

// ============================================================
// MAIN TICK  (replaces setInterval 10ms)
// ============================================================

function tick(s, projects, activeProjects) {
    s.ticks = s.ticks + 1;

    milestoneCheck(s);

    if (s.compFlag == 1) { calculateOperations(s); }
    if (s.humanFlag == 1) { calculateTrust(s); }
    if (s.qFlag == 1) { quantumCompute(s); }

    manageProjects(s, projects, activeProjects);
    updateClipRate(s);

    // WireBuyer
    if (s.humanFlag == 1 && s.wireBuyerFlag == 1 && s.wireBuyerStatus == 1 && s.wire <= 1) {
        buyWire(s);
    }

    // Explore
    if (s.probeCount >= 1) { exploreUniverse(s); }

    // Phase 2
    if (s.humanFlag == 0) {
        updatePower(s);
        updateSwarm(s);
        acquireMatter(s);
        processMatter(s);
    }

    // Factories
    var fbst = 1;
    if (s.factoryBoost > 1) { fbst = s.factoryBoost * s.factoryLevel; }
    if (s.dismantle < 4) {
        clipClick(s, s.powMod * fbst * (Math.floor(s.factoryLevel) * s.factoryRate));
    }

    // Phase 3 probe functions
    if (s.spaceFlag == 1) {
        if (s.probeCount < 0) { s.probeCount = 0; }
        encounterHazards(s);
        spawnFactories(s);
        spawnHarvesters(s);
        spawnWireDrones(s);
        spawnProbes(s);
        drift(s);
    }

    // AutoClippers
    if (s.dismantle < 4) {
        clipClick(s, s.clipperBoost * (s.clipmakerLevel / 100));
        clipClick(s, s.megaClipperBoost * (s.megaClipperLevel * 5));
    }

    // Demand curve
    if (s.humanFlag == 1) {
        s.marketing = (Math.pow(1.1, (s.marketingLvl - 1)));
        s.demand = (((.8 / s.margin) * s.marketing * s.marketingEffectiveness) * s.demandBoost);
        s.demand = s.demand + ((s.demand / 10) * s.prestigeU);
    }

    // Creativity
    if (s.creativityOn && s.operations >= (s.memory * 1000)) {
        calculateCreativity(s);
    }

    // End-game dismantling timers
    if (s.project148 && s.project148.flag == 1) { s.endTimer1++; }
    if (s.project211 && s.project211.flag == 1) { s.endTimer2++; }
    if (s.project212 && s.project212.flag == 1) { s.endTimer3++; }
    if (s.project213 && s.project213.flag == 1) { s.endTimer4++; }
    if (s.project215 && s.project215.flag == 1) { s.endTimer5++; }
    if (s.project216 && s.project216.flag == 1 && s.wire == 0) { s.endTimer6++; }
}

// ============================================================
// SLOW TICK  (replaces setInterval 100ms — every 10 main ticks)
// ============================================================

function slowTick(s) {
    adjustWirePrice(s);

    if (s.humanFlag == 1) {
        if (Math.random() < (s.demand / 100)) {
            sellClips(s, Math.floor(.7 * Math.pow(s.demand, 1.15)));
        }
        s.secTimer = (s.secTimer || 0) + 1;
        if (s.secTimer >= 10) {
            calculateRev(s);
            s.secTimer = 0;
        }
    }

    // Investment engine slow updates
    if (s.investmentEngineFlag == 1 && s.humanFlag == 1) {
        stockShop(s);
        updatePortfolio(s);
    }
}

// ============================================================
// QUANTUM COMPUTING
// ============================================================

function quantumCompute(s) {
    s.qClock = s.qClock + .01;
    var q = 0;
    for (var i = 0; i < s.qChips.length; i++) {
        s.qChips[i].value = Math.sin(s.qClock * s.qChips[i].waveSeed * s.qChips[i].active);
        q = q + s.qChips[i].value;
    }
    var qq = Math.ceil(q * 360);
    var buffer = (s.memory * 1000) - s.standardOps;
    var damper = (s.tempOps / 100) + 5;
    if (qq > buffer) {
        s.tempOps = s.tempOps + Math.ceil(qq / damper) - buffer;
        qq = buffer;
    }
    s.standardOps = s.standardOps + qq;
}

// ============================================================
// PROBE DESIGN ADJUSTMENTS
// ============================================================

function increaseProbeTrust(s) {
    if (s.yomi >= s.probeTrustCost && s.probeTrust < s.maxTrust) {
        s.yomi = s.yomi - s.probeTrustCost;
        s.probeTrust++;
        s.probeTrustCost = Math.floor(Math.pow(s.probeTrust + 1, 1.47) * 500);
    }
}

function increaseMaxTrust(s) {
    if (s.honor >= s.maxTrustCost) {
        s.honor = s.honor - s.maxTrustCost;
        s.maxTrust = s.maxTrust + 10;
    }
}

function raiseProbeSpeed(s) { if (s.probeUsedTrust < s.probeTrust) { s.attackSpeed += s.attackSpeedMod; s.probeSpeed++; } }
function lowerProbeSpeed(s) { if (s.probeSpeed > 0) { s.attackSpeed -= s.attackSpeedMod; s.probeSpeed--; } }
function raiseProbeNav(s)   { if (s.probeUsedTrust < s.probeTrust) { s.probeNav++; } }
function lowerProbeNav(s)   { if (s.probeNav > 0) { s.probeNav--; } }
function raiseProbeHaz(s)   { if (s.probeUsedTrust < s.probeTrust) { s.probeHaz++; } }
function lowerProbeHaz(s)   { if (s.probeHaz > 0) { s.probeHaz--; } }
function raiseProbeRep(s)   { if (s.probeUsedTrust < s.probeTrust) { s.probeRep++; } }
function lowerProbeRep(s)   { if (s.probeRep > 0) { s.probeRep--; } }
function raiseProbeFac(s)   { if (s.probeUsedTrust < s.probeTrust) { s.probeFac++; } }
function lowerProbeFac(s)   { if (s.probeFac > 0) { s.probeFac--; } }
function raiseProbeHarv(s)  { if (s.probeUsedTrust < s.probeTrust) { s.probeHarv++; } }
function lowerProbeHarv(s)  { if (s.probeHarv > 0) { s.probeHarv--; } }
function raiseProbeWire(s)  { if (s.probeUsedTrust < s.probeTrust) { s.probeWire++; } }
function lowerProbeWire(s)  { if (s.probeWire > 0) { s.probeWire--; } }
function raiseProbeCombat(s){ if (s.probeUsedTrust < s.probeTrust) { s.probeCombat++; } }
function lowerProbeCombat(s){ if (s.probeCombat > 0) { s.probeCombat--; } }

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    tick,
    slowTick,
    buyWire,
    clipClick,
    makeClipper,
    makeMegaClipper,
    sellClips,
    raisePrice,
    lowerPrice,
    buyAds,
    addProc,
    addMem,
    calculateOperations,
    calculateTrust,
    calculateCreativity,
    milestoneCheck,
    manageProjects,
    adjustWirePrice,
    investUpgrade,
    investDeposit,
    investWithdraw,
    makeFactory,
    makeHarvester,
    makeWireDrone,
    factoryReboot,
    harvesterReboot,
    wireDroneReboot,
    makeFarm,
    makeBattery,
    farmReboot,
    batteryReboot,
    updatePower,
    acquireMatter,
    processMatter,
    updateSwarm,
    synchSwarm,
    entertainSwarm,
    makeProbe,
    spawnProbes,
    exploreUniverse,
    encounterHazards,
    spawnFactories,
    spawnHarvesters,
    spawnWireDrones,
    drift,
    increaseProbeTrust,
    increaseMaxTrust,
    raiseProbeSpeed, lowerProbeSpeed,
    raiseProbeNav, lowerProbeNav,
    raiseProbeHaz, lowerProbeHaz,
    raiseProbeRep, lowerProbeRep,
    raiseProbeFac, lowerProbeFac,
    raiseProbeHarv, lowerProbeHarv,
    raiseProbeWire, lowerProbeWire,
    raiseProbeCombat, lowerProbeCombat,
    quantumCompute,
};