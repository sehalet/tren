/*
 * Script Name: Evolved Fake Train
 * Version: v1.1.0
 * Last Updated: 2021-12-05
 * Author: RedAlert
 * Author URL: https://twscripts.dev/
 * Author Contact: redalert_tw (Discord)
 * Approved: N/A
 * Approved Date: 2021-11-05
 * Mod: JawJaw
 */

/*--------------------------------------------------------------------------------------
 * This script can NOT be cloned and modified without permission from the script author.
 --------------------------------------------------------------------------------------*/

// User Input
if (typeof DEBUG !== 'boolean') DEBUG = false;

// Script Config
var scriptConfig = {
    scriptData: {
        prefix: 'evolvedFakeTrain',
        name: 'Evolved Fake Train',
        version: 'v1.1.0',
        author: 'RedAlert',
        authorUrl: 'https://twscripts.dev/',
        helpLink:
            'https://forum.tribalwars.net/index.php?threads/evolved-fake-train.287900/',
    },
    translations: {
        en_DK: {
            'Evolved Fake Train': 'Evolved Fake Train',
            Help: 'Help',
            'This script can only be run on command confirmation screen!':
                'This script can only be run on command confirmation screen!',
            'Fixed units': 'Fixed units',
            'Dynamically calculated amounts': 'Dynamically calculated amounts',
            'Set all dynamic units': 'Set all dynamic units',
            'Clone First': 'Clone First',
            Reset: 'Reset',
        },
    },
    allowedMarkets: [],
    allowedScreens: ['place'],
    allowedModes: [],
    isDebug: DEBUG,
    enableCountApi: true,
};

$.getScript(
    `https://twscripts.dev/scripts/twSDK.js?url=${document.currentScript.src}`,
    async function () {
        // Initialize Library
        await twSDK.init(scriptConfig);
        const scriptInfo = twSDK.scriptInfo();
        const isValidScreen = twSDK.checkValidLocation('screen');
        const gameMode = twSDK.getParameterByName('try');

        // Script business logic
        (async function () {
            if (isValidScreen && gameMode === 'confirm') {
                // build user interface
                buildUI();

                // register action handler
                onClickSetUnitAmounts();
                onClickSetDynamicallyCalculatedUnits();
                onClickSetAllDynamicallyCalculatedUnits();
                onClickCloneFirst();
                onClickResetUnitAmounts();
            } else {
                UI.ErrorMessage(
                    twSDK.tt(
                        'This script can only be run on command confirmation screen!'
                    )
                );
            }
        })();

        // Render: Build the user interface
        function buildUI() {
            const unitsToggle = buildUnitsToggle();

            const content = `
                <div class="ra-mb15">
                    <a href="javascript:void(0);" class="btn" id="raResetUnitAmountsBtn">
                        <span>${twSDK.tt('Reset')}</span>
                    </a>
                    <a href="javascript:void(0);" class="btn" id="raSetAllDynamicUnitsBtn">
                        <span>${twSDK.tt('Set all dynamic units')}</span>
                    </a>
                    <a href="javascript:void(0);" class="btn" id="raCloneFirstBtn">
                        <span>${twSDK.tt('Clone First')}</span>
                    </a>
                </div>
                <div class="ra-mb15">
                    <label class="ra-label">${twSDK.tt('Fixed units')}</label>
                    <div class="ra-dflex">
                        <a href="javascript:void(0);" class="btn ra-btn-set-units" data-units-amounts='{"ram": 1, "spy": 1}'>
                            <span>1 <img src="/graphic/unit/tiny/ram.png"></span>
                            <span>1 <img src="/graphic/unit/tiny/spy.png"></span>
                        </a>
                        <a href="javascript:void(0);" class="btn ra-btn-set-units" data-units-amounts='{"catapult": 1, "spy": 1}'>
                            <span>1 <img src="/graphic/unit/tiny/catapult.png"></span>
                            <span>1 <img src="/graphic/unit/tiny/spy.png"></span>
                        </a>
                        <a href="javascript:void(0);" class="btn ra-btn-set-units" data-units-amounts='{"spy": 1, "catapult": 20}'>
                            <span>1 <img src="/graphic/unit/tiny/spy.png"></span>
                            <span>20 <img src="/graphic/unit/tiny/catapult.png"></span>
                        </a>
                        <a href="javascript:void(0);" class="btn ra-btn-set-units" data-units-amounts='{"spy": 20, "ram": 1}'>
                            <span>20 <img src="/graphic/unit/tiny/spy.png"></span>
                            <span>1 <img src="/graphic/unit/tiny/ram.png"></span>
                        </a>
                    </div>
                </div>
                <div class="ra-mb15">
                    <label class="ra-label">${twSDK.tt(
                        'Dynamically calculated amounts'
                    )}</label>
                    <div class="ra-dflex">
                        ${unitsToggle}
                    </div>
                </div>
            `;

            const customStyle = `
                .ra-evolved-fake-train-body {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    background-color: #fff;
                    padding: 10px;
                    border: 2px solid #000;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
                .ra-dflex { display: flex; flex-flow: row wrap; }

                .ra-btn-set-units { font-size: 15px; width: 60px; height: auto !important; }
                .ra-btn-set-units span { margin: 4px; display: block; }

                .ra-btn-set-all-units { margin-bottom: 5px; }

                .ra-label { font-weight: bold; display: block; margin-bottom: 8px; }
                .ra-dflex { display: flex; align-items: flex-start; }

                .ra-evolved-fake-train-body .btn-confirm-yes { padding: 3px; }
            `;

            twSDK.renderFixedWidget(
                content,
                'raEvolvedFakeTrain',
                'ra-evolved-fake-train',
                customStyle
            );
        }

        // Action Handler: Handle click on set unit amounts button
        function onClickSetUnitAmounts() {
            jQuery('.ra-btn-set-units').on('click', function (e) {
                e.preventDefault();

                addTroopConfigurator();
                toggleCurrentActiveButtonState(this);

                const currentChosenUnits = JSON.parse(
                    jQuery(this).attr('data-units-amounts')
                );

                for (let unit in currentChosenUnits) {
                    jQuery(
                        `.units-row input[type="number"][data-unit="${unit}"]`
                    ).val(currentChosenUnits[unit]);
                }

                Place.confirmScreen.updateUnitsSum();
                Place.confirmScreen.checkForUnprotectedSnobs();
                Place.confirmScreen.checkAndShowCatapultTargetSelection();
            });
        }

        // Action Handler: Set dynamically calculated units
        function onClickSetDynamicallyCalculatedUnits() {
            jQuery('.ra-btn-set-all-units').on('click', function (e) {
                e.preventDefault();

                addTroopConfigurator();
                toggleCurrentActiveButtonState(this);

                unitAutoBalancer([jQuery(this).data('unit')]);
            });
        }

        // Action Handler: Set all dynamically calculated units
        function onClickSetAllDynamicallyCalculatedUnits() {
            jQuery('#raSetAllDynamicUnitsBtn').on('click', function (e) {
                e.preventDefault();

                addTroopConfigurator();
                toggleCurrentActiveButtonState(this);

                unitAutoBalancer([
                    'axe',
                    'light',
                    'marcher',
                    'spy',
                    'ram',
                    'catapult',
                ]);
            });
        }

        // Action Handler: Reset unit amounts
        function onClickResetUnitAmounts() {
            jQuery('#raResetUnitAmountsBtn').on('click', function (e) {
                e.preventDefault();

                toggleCurrentActiveButtonState(this);

                game_data.units.forEach((unit) =>
                    jQuery(
                        `.units-row input[type="number"][data-unit="${unit}"]`
                    ).val('')
                );
                jQuery('#place_confirm_units img.float_right').trigger('click');

                Place.confirmScreen.updateUnitsSum();
            });
        }

        // Action Handler: Clone the first attack
        function onClickCloneFirst() {
            jQuery('#raCloneFirstBtn').on('click', function (e) {
                e.preventDefault();

                addTroopConfigurator();
                toggleCurrentActiveButtonState(this);

                const currentChosenUnits = Place.confirmScreen.getSendUnits();

                for (let unit in currentChosenUnits) {
                    jQuery(
                        `.units-row input[type="number"][data-unit="${unit}"]`
                    ).val(currentChosenUnits[unit]);
                }

                Place.confirmScreen.updateUnitsSum();
                Place.confirmScreen.checkForUnprotectedSnobs();
               
