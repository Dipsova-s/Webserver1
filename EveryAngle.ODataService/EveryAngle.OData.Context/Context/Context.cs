using EveryAngle.OData.Proxy;
using EveryAngle.Utilities.IoC;
using System.Net.Http;

namespace EveryAngle.OData.EAContext
{
    public class Context : IContext
    {
        public const string Key_eaac = "eaac";
        private readonly HttpRequestMessage _requestMessage;

        public Context() { User = new User(); }

        public Context(
            HttpRequestMessage requestMessage,
            User user) : this()
        {
            User = user;
            _requestMessage = requestMessage;
        }

        public User User { get; private set; }
        public string ClientIp { get; set; }
    }
}