using EveryAngle.OData.Utils.Constants;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Web;

namespace EveryAngle.OData.Service.Utils
{
    public class BasicAuthenticationHeaderParserWrapper : IBasicAuthenticationHeaderParserWrapper
    {
        public string GetBasicAuthenticationBase64EncodedCredentials(NameValueCollection headerCollection)
        {
            return BasicAuthenticationHeaderParser.GetBasicAuthenticationBase64EncodedCredentials(headerCollection);
        }
    }
}