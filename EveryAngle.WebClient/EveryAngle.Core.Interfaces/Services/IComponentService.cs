using EveryAngle.Core.ViewModels;
using System;
using System.Collections.Generic;

namespace EveryAngle.Core.Interfaces.Services
{
    public interface IComponentService
    {
        IEnumerable<ComponentViewModel> GetItems();
        void Delete(Guid registrationId);
    }
}
