<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">
  <xsl:template match="/">
    <table id="csltemplate" >
      <tr>
        <th class="gridColumnCentered"></th>
        <th class="columnNumber">PID</th>
        <th class="columnDate">Date</th>
        <th>Thread</th>
        <th>Message</th>
        <th>Detail</th>
      </tr>
      <xsl:for-each select="CodeSiteLog/Message">
        <tr>
          <td>
            <span>
              <xsl:attribute name="class" >
                <xsl:value-of select="./@MsgType"/>
              </xsl:attribute>
            </span>
          </td>
          <td>
            <xsl:value-of select="ProcessID"/>
          </td>
          <td>
            <xsl:value-of select="concat(./TimeStamp/@Date,' ',./TimeStamp/@Time)"/>
          </td>
          <td>
            <xsl:value-of select="ThreadName"/>
          </td>
          <td class="shorten">
            <xsl:value-of select="./@MsgText"/>
          </td>
          <td>
            <xsl:choose>
              <xsl:when test="count(./Details/Item) &gt; 0">
                <xsl:call-template name="RenderAsTable">
                  <xsl:with-param name="items" select="./Details/Item"  />
                </xsl:call-template>
              </xsl:when>
              <xsl:otherwise>
                <xsl:call-template name="RenderAsText">
                  <xsl:with-param name="detail" select="./Details" />
                </xsl:call-template>
              </xsl:otherwise>
            </xsl:choose>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>

  <xsl:template name="RenderAsTable">
    <xsl:param name="items"/>
    <a class="btn btnMoreLog">More...</a>
    <ul class="collapsible logTooltip">
      <xsl:for-each select="$items">
        <li>
          <xsl:value-of select="."/>
        </li>
      </xsl:for-each>
    </ul>
  </xsl:template>

  <xsl:template name="RenderAsText">
    <xsl:variable name="detail" />
    <div class="logTooltip" data-role="tooltip">
        <xsl:value-of select="$detail"/>
    </div>
  </xsl:template>


</xsl:stylesheet>
