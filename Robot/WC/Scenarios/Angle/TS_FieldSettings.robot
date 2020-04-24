*** Settings ***
Resource    		${EXECDIR}/WC/POM/Search/SearchPage.robot
Resource    		${EXECDIR}/WC/POM/Angle/AnglePage.robot
Resource            ${EXECDIR}/WC/POM/Angle/FieldSettings.FieldFormatsPopup.Robot

*** Keywords ***
Verify Field Setting All Format
    Click Display Tab
    Verfiy Field Format In Row Area: Enum
    Verfiy Field Format In Row Area: Text
    Verfiy Field Format In Row Area: YesNo
    Verfiy Field Format In Row Area: Time
    Verfiy Field Format In Row Area: Datetime
    Scroll Display Tab To Vertical    500
    Verfiy Field Format In Column Area: Currency
    Verfiy Field Format In Column Area: Date
    Verfiy Field Format In Column Area: Number
    Verfiy Field Format In Column Area: Percentage
    Verfiy Field Format In Column Area: Period
    Verfiy Field Format In Data Area: Count
    Verfiy Field Format In Data Area: Currency
    Verfiy Field Format In Data Area: Number
    Verfiy Field Format In Data Area: Percantage
    Verfiy Field Format In Data Area: Period

Verfiy Field Format In Row Area: Enum
    Click Field In Row Area By Field Index    0
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-enum
    Dropdown Bucket Should Contain Option  First 2 characters
    Dropdown Bucket Should Not Contain Option  Last 2 characters
    Select Bucket Option    Individual
    Select Bucket Format Option Should Be Valid
    Select Bucket Option    First 2 characters
    Select Bucket Format Option Should Not Be Valid
    Save Field Format

Verfiy Field Format In Row Area: Text
    Click Field In Row Area By Field Index    1
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-text
    Select Bucket Option    Individual
    Select Bucket Option    First 2 characters
    Select Bucket Option    Last 2 characters
    Save Field Format

Verfiy Field Format In Row Area: YesNo
    Click Field In Row Area By Field Index    2
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-boolean
    Select Bucket Option    Individual
    Save Field Format

Verfiy Field Format In Row Area: Time
    Click Field In Row Area By Field Index    3
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-time
    Select Bucket Option    Per hour
    Select Second Format    Use default
    Select Second Format    None
    Select Second Format    ss
    Save Field Format

Verfiy Field Format In Row Area: Datetime
    Click Field In Row Area By Field Index    4
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Column Area: Currency
    Click Field In Column Area By Field Index    0
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Date
    Click Field In Column Area By Field Index    1
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Column Area: Number
    Click Field In Column Area By Field Index    2
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Percentage
    Click Field In Column Area By Field Index    3
    Verify Field Format For Number Currency Percentage In Row And Column Area

Verfiy Field Format In Column Area: Period
    Click Field In Column Area By Field Index    4
    Verify Field Format For Period Date Datetime

Verfiy Field Format In Data Area: Count
    Click Field In Data Area By Field Index     0
    Click Show Field Format For Field Settings
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Thousands (K)
    Select Display Unit    Millions (M)
    Save Field Format

Verfiy Field Format In Data Area: Currency
    Click Field In Data Area By Field Index     1
    Verify Field Format For Number(Double) Currency Percentage In Data Area

Verfiy Field Format In Data Area: Number
    Click Field In Data Area By Field Index     2
    Verify Field Format For Number(Integer) And Set In Data Area

Verfiy Field Format In Data Area: Percantage
    Click Field In Data Area By Field Index     3
    Verify Field Format For Number(Double) Currency Percentage In Data Area

Verfiy Field Format In Data Area: Period
    Click Field In Data Area By Field Index     4
    Verify Field Format For Number(Integer) And Set In Data Area


Verify Field Format For Number Currency Percentage In Row And Column Area
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-double
    Select Bucket Option    0.001
    Dropdown Unit Should Contain Option   Use default
    Dropdown Unit Should Contain Option   None
    Dropdown Unit Should Not Contain Option   Thousands (K)
    Dropdown Unit Should Not Contain Option   Millions (M)
    Select Bucket Option    1
    Dropdown Unit Should Contain Option   Use default
    Dropdown Unit Should Contain Option   None
    Dropdown Unit Should Not Contain Option   Thousands (K)
    Dropdown Unit Should Not Contain Option   Millions (M)
    Select Bucket Option    1,000
    Dropdown Unit Should Contain Option   Use default
    Dropdown Unit Should Contain Option   None
    Dropdown Unit Should Contain Option   Thousands (K)
    Dropdown Unit Should Not Contain Option   Millions (M)
    Select Bucket Option    1,000,000
    Dropdown Unit Should Contain Option   Use default
    Dropdown Unit Should Contain Option   None
    Dropdown Unit Should Contain Option   Thousands (K)
    Dropdown Unit Should Contain Option   Millions (M)
    Select Decimal Option    Use default
    Select Decimal Option    None
    Select Decimal Option    6
    Thousands separator Option Should Be Valid
    Save Field Format

Verify Field Format For Period Date Datetime
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-date
    Select Bucket Option    Per day
    Select Bucket Option    Per quarter
    Select Bucket Option    Per year
    Save Field Format

Verify Field Format For Number(Double) Currency Percentage In Data Area
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-double
    Select Bucket Option    Min
    Select Bucket Option    Sum
    Select Bucket Option    Average
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Millions (M)
    Select Decimal Option    Use default
    Select Decimal Option    None
    Select Decimal Option    6
    Save Field Format

Verify Field Format For Number(Integer) And Set In Data Area
    Click Show Field Format For Field Settings
    Input Bucket Alias Name  my-integer
    Select Bucket Option    Min
    Select Bucket Option    Sum
    Select Bucket Option    Average
    Select Decimal Option    Use default
    Select Decimal Option    None
    Select Decimal Option    6
    Select Bucket Option    Max
    Element Should Not Be Visible    ${ddlDecimalOption}
    Select Display Unit    Use default
    Select Display Unit    None
    Select Display Unit    Millions (M)
    Save Field Format

Check Chart Field Settings In Case Unknown Fields
    Page Should Contain Element         ${ddlChartType} .k-dropdown-wrap.k-state-disabled
    Page Should Contain Element         ${btnFieldSettingOptions}.disabled
    Page Should Not Contain Element     ${btnAddRowAreaField}
    Page Should Not Contain Element     ${btnAddColumnAreaField}
    Page Should Not Contain Element     ${btnAddDataAreaField}

    Click Field In Row Area By Field Index    0
    Page Should Not Contain Element   ${btnFieldSettingsFieldFormat}
    Page Should Not Contain Element   ${btnFieldSettingsSort}
    Page Should Not Contain Element   ${btnFieldSettingsAddFilter}
    Page Should Contain Element       ${btnFieldSettingsFieldInfo}
    Page Should Not Contain Element   ${btnFieldSettingsDelete}

    Click Field In Data Area By Field Index    0
    Page Should Not Contain Element   ${btnFieldSettingsFieldFormat}

Check Pivot Field Settings In Case Known Fields
    Page Should Contain Element   ${btnFieldSettingOptions}:not(.disabled)
    Page Should Contain Element   ${btnAddRowAreaField}:not(.disabled)
    Page Should Contain Element   ${btnAddColumnAreaField}:not(.disabled)
    Page Should Contain Element   ${btnAddDataAreaField}:not(.disabled)

    Click Field In Row Area By Field Index    0
    Page Should Not Contain Element   ${btnFieldSettingsFieldFormat}
    Page Should Not Contain Element   ${btnFieldSettingsSort}
    Page Should Not Contain Element   ${btnFieldSettingsAddFilter}
    Page Should Contain Element       ${btnFieldSettingsFieldInfo}
    Page Should Contain Element       ${btnFieldSettingsDelete}
    Page Should Contain Element       ${btnFieldSettingsError}

    Click Field In Data Area By Field Index    0
    Page Should Contain Element   ${btnFieldSettingsFieldFormat}
    