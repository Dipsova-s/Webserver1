using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Web;

namespace EveryAngle.OData.Service.Utils
{
    public interface IBasicAuthenticationHeaderParserWrapper
    {
        string GetBasicAuthenticationBase64EncodedCredentials(NameValueCollection headerCollection);
    }
}