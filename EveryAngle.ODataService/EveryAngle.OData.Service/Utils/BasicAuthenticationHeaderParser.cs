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
    internal static class BasicAuthenticationHeaderParser
    {
        private const string _authorizationHeaderName = "Authorization";
        private const string _basicAuthenticationSchemeName = "basic";

        private static NameValueCollection ConvertHttpRequestHeadersToNameValueCollection(HttpRequestHeaders headers)
        {
            NameValueCollection headersNameValueCollection = new NameValueCollection();
            // RFC 2616: use , as separator for multiple http header values: https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2
            foreach (var keyValuePair in headers)
            {
                headersNameValueCollection.Add(keyValuePair.Key, string.Join(", ", keyValuePair.Value));
            }
            return headersNameValueCollection;
        }

        internal static string GetBasicAuthenticationBase64EncodedCredentials(HttpRequestHeaders headers)
        {
            return GetBasicAuthenticationBase64EncodedCredentials(ConvertHttpRequestHeadersToNameValueCollection(headers));
        }

        /// <summary>
        /// Gets the base64 encoded credentials from the basic authentication header.
        /// Returns null when not found
        /// </summary>
        /// <param name="headerCollection">Http header collection</param>
        /// <returns></returns>
        internal static string GetBasicAuthenticationBase64EncodedCredentials(NameValueCollection headerCollection)
        {
            // example:  authHeader = "Basic ZWFhZG1pbjpQQHNzdzByZA=="
            
            string authenticationHeaderValuesString = headerCollection[_authorizationHeaderName];
            if (string.IsNullOrEmpty(authenticationHeaderValuesString))
                return null;

            // An http header may have multiple values separated by ','
            string[] authenticationHeaderValueStrings = authenticationHeaderValuesString.Split(',');

            // find the header for basic auth scheme (starts with 'Basic ')
            string basicAuthHeaderValueString = authenticationHeaderValueStrings.FirstOrDefault(value => value.Trim().StartsWith(_basicAuthenticationSchemeName + " ", StringComparison.OrdinalIgnoreCase));
            if (string.IsNullOrEmpty(basicAuthHeaderValueString))
                return null;

            // Parse the auth header value found, return the parameter which is the base64 encoded credentials
            return AuthenticationHeaderValue.Parse(basicAuthHeaderValueString).Parameter;
        }
    }
}