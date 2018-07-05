*** Settings ***
Resource                  ${EXECDIR}/resources/WCSettings.robot
Suite Setup               Go To Refresh Cycle Page With Admin User
Suite Teardown            Logout MC Then Close Browser
Test Teardown             Reload Refresh Cycle Page
Force Tags                MC    acc_mc

*** Variables ***
${RefreshCycleNameForMidNight}            Refresh Cycle for mid night
${MidNight}                               00:00
${RefreshCycleNameForBeforeMidNight}      Refresh Cycle for before mid night
${BeforeMidNight}                         23:59
${RefreshCycleNameForAfterMidNight}       Refresh Cycle for after mid night
${AfterMidNight}                          00:01

*** Test Cases ***
Test Refresh Cycle For Validate Time
    # Test mid night time
    Set Refresh Cycle Time Detail       ${RefreshCycleNameForMidNight}    ${MidNight}
    Verify Refresh Cycle After Set      ${RefreshCycleNameForMidNight}    ${MidNight}

    # Test before mid night time
    Eidt Refresh Cycle Time Detail      ${RefreshCycleNameForBeforeMidNight}    ${BeforeMidNight}
    Verify Refresh Cycle After Set      ${RefreshCycleNameForBeforeMidNight}    ${BeforeMidNight}

    # Test after mid night time
    Eidt Refresh Cycle Time Detail      ${RefreshCycleNameForAfterMidNight}    ${AfterMidNight}
    Verify Refresh Cycle After Set      ${RefreshCycleNameForAfterMidNight}    ${AfterMidNight}