using System;
using System.Net.Http;
using System.Web;

namespace EveryAngle.WebClient.Service.Security.Interfaces
{
    public interface IValidationRequestService
    {
        Func<IValidationRequestContext> ValidatorFunction { get; set; }

        string GetToken();
        void ValidateToken(HttpRequestMessage request);
        void ValidateToken(HttpRequestBase request);
    }
}
