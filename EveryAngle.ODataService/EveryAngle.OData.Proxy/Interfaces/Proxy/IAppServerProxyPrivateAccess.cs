using RestSharp;

namespace EveryAngle.OData.Proxy
{
    public interface IAppServerProxyPrivateAccess
    {
        T Get<T>(string resourceUrl, User user) where T : new();
        T Post<T>(string resourceUrl, object obj, User user, bool redirect = false) where T : new();
        IRestRequest NewRestRequest(string resourceUrl, string securityToken, Method method);
    }
}
