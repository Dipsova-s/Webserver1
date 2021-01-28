using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace EveryAngle.WebClient.Service.Security.Interfaces
{
    public interface IValidationRequestService
    {
        string GetToken();
        Task ValidateToken(HttpRequestMessage request);
        Task ValidateToken(HttpRequestBase request);
    }
}
