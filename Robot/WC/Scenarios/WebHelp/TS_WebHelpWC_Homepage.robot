*** Keywords ***
Screenshot "WC_Homepage" page
    Search Filter By Query String    sort=name&dir=asc&fq=facetcat_bp:(S2D)%20AND%20-facetcat_characteristics:(facet_has_warnings)
    Click Change View To Displays Mode

    Set Window Size    1600   700
    Sleep    ${TIMEOUT_LARGEST}

    Crop Logo
    Crop Panes Homepage

    Maximize Browser window
    Sleep    ${TIMEOUT_LARGEST}

Crop Logo
    # the same image as WC_Action_Button_Logo.png
    Crop WebHelp Image With Dimensions    WC_EA_Logo.png    css=#TopBar .Wrapper    15    3    150    41

Crop Panes Homepage
    Highlight WebHelp Element    css=#TopBar                text=1
    Update Heightlight Box   height   3
    Highlight WebHelp Element    css=#SearchBar             text=2
    Highlight WebHelp Element    css=#LeftMenu              text=3
    Update Heightlight Box   width   5
    Highlight WebHelp Element    css=#SearchResultList      text=4
    Update Heightlight Box   top   -3
    Update Heightlight Box   height   1
    Crop WebHelp Image    WC_panes_homepage.png    css=#MainContainer
    Clear WebHelp Highlights
