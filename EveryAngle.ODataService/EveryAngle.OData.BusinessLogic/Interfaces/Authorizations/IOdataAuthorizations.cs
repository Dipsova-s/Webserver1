using EveryAngle.OData.Proxy;

namespace EveryAngle.OData.BusinessLogic.Interfaces.Authorizations
{
    public interface IOdataAuthorizations
    {
        bool MayView(User user);
    }
}
