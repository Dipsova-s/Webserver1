using EveryAngle.OData.DTO;
using EveryAngle.OData.Proxy;

namespace EveryAngle.OData.EAContext
{
    public interface IContext
    {
        User User { get; }

        string ClientIp { get; set; }
    }
}