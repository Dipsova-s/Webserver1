*** Variables ***
${btnScrollLeft}        BtnScrollLeft
${btnScrollRight}       BtnScrollRight
${btnScrollLeftDisabled}    jquery=#BtnScrollLeft.disabled
${btnScrollRightDisabled}    jquery=#BtnScrollRight.disabled

*** Keywords ***
Verify Display Scrolling Buttons Are Hidden
    Wait Until Element Is Not Visible  ${btnScrollLeft}
    Wait Until Element Is Not Visible  ${btnScrollRight}

Verify Display Scrolling Buttons Are Shown
    Wait Until Element Is Visible  ${btnScrollLeft}
    Wait Until Element Is Visible  ${btnScrollRight}

Scroll Display Tab To Left
    Click Element  ${btnScrollLeft}
    Sleep    ${TIMEOUT_LARGEST}

Scroll Display Tab To Right
    Click Element  ${btnScrollRight}
    Sleep    ${TIMEOUT_LARGEST}

Verify Left Display Scrolling Button Is Enabled
    Wait Until Element Is Enabled  ${btnScrollLeft}

Verify Right Display Scrolling Button Is Enabled
    Wait Until Element Is Enabled  ${btnScrollRight}

Verify Left Display Scrolling Button Is Disabled
    Wait Until Page Contains Element  ${btnScrollLeftDisabled}

Verify Right Display Scrolling Button Is Disabled
    Wait Until Page Contains Element  ${btnScrollRightDisabled}

Scroll Display Tab To The Rightmost
    Repeat Keyword  2 times  Scroll Display Tab To Right

Scroll Display Tab To The Leftmost
    Repeat Keyword  3 times  Scroll Display Tab To Left