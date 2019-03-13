*** Variables ***
${divWelcomeFeedItems}         css=#LandingPage .notificationsFeed .item
${divTopbarFeedItems}          css=#NotificationsFeedMenu .notificationsFeed .item
${divTopbarFeedLinks}          jquery=#LandingPage .notificationsFeed .item a
${btnTopbarFeedButton}         css=#NotificationsFeed
${divTopbarFeedPopup}          css=#NotificationsFeedMenu

*** Keywords ***
Wait Notification Feed Loaded
    Wait Until Page Contains Element    ${divTopbarFeedItems}

Open Topbar Feed Menu
    ${IsVisible}    Is Element Visible    ${divTopbarFeedPopup}
    Run Keyword If    ${IsVisible} == False    Click Element    ${btnTopbarFeedButton}
    Sleep    ${TIMEOUT_GENERAL}

Close Topbar Feed Menu
    ${IsVisible}    Is Element Visible    ${divTopbarFeedPopup}
    Run Keyword If    ${IsVisible} == True    Click Element    ${btnTopbarFeedButton}
    Sleep    ${TIMEOUT_GENERAL}

Click Topbar Feed Item
    [Arguments]    ${index}
    Click Element    ${divTopbarFeedLinks}:eq(${index})

Check Notification Feed On Welcome Page
    Page Should Contain Element      ${divWelcomeFeedItems}
    Element Should Be Visible        ${divWelcomeFeedItems}
    Element Should Not Be Visible    ${btnTopbarFeedButton}
    Element Should Not Be Visible    ${divTopbarFeedItems}

Check Notification Feed On Topbar
    Page Should Contain Element      ${divTopbarFeedItems}
    Element Should Not Be Visible    ${divTopbarFeedItems}
    Element Should Be Visible        ${btnTopbarFeedButton}
    Element Should Not Be Visible    ${divWelcomeFeedItems}
