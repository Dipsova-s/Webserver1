using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System;
using System.IO;
using System.Reflection;
using System.Threading;

namespace SeleniumDemo
{
    [TestClass]
    public class SmokeTests
    {
        public TestContext TestContext { get; set; }
             

        [TestMethod]
        public void loginToWebClient()
        {
            var chromeOptions = new ChromeOptions();
            //chromeOptions.AddArguments("headless");

            using (var driver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), chromeOptions))
            {

                driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(60);
                string eaurl = this.TestContext.Properties["url"].ToString(); 
                driver.Navigate().GoToUrl(eaurl);
                driver.Manage().Window.Maximize();

                Thread.Sleep(5000);
                // Find the text input element by its name
                string Username = this.TestContext.Properties["Username"].ToString();
                string Password = this.TestContext.Properties["Password"].ToString();
                driver.FindElementByXPath("//input[@name='Username']").SendKeys(Username);
                driver.FindElementByXPath("//input[@name='Password']").SendKeys(Password);
                driver.FindElementByXPath("//button[.='Login']").Click();

                Thread.Sleep(18000);

                var element = driver.FindElementByXPath("//span[contains(.,'Business')]");
                Assert.IsTrue(element.Displayed);

                driver.Quit();




            }

        }




        [TestMethod]
        public void loginToManagemnetConsole()
        {
            var chromeOptions = new ChromeOptions();
            //chromeOptions.AddArguments("headless");

            using (var driver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), chromeOptions))
            {

                driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(60);
                string eaurl = this.TestContext.Properties["url"].ToString(); 
                
                driver.Navigate().GoToUrl(eaurl);
                driver.Manage().Window.Maximize();

                Thread.Sleep(5000);
                // Find the text input element by its name
                string Username = this.TestContext.Properties["Username"].ToString();
                string Password = this.TestContext.Properties["Password"].ToString();
                driver.FindElementByXPath("//input[@name='Username']").SendKeys(Username);
                driver.FindElementByXPath("//input[@name='Password']").SendKeys(Password);
                driver.FindElementByXPath("//button[.='Login']").Click();

               

                //Navigate to ITMC from WebClient

                driver.FindElementByXPath("//span[.='EAAdmin']").Click();

                driver.FindElementByXPath("//span[contains(.,'IT Management')]").Click();
                driver.SwitchTo().Window(driver.WindowHandles[1]);


                Thread.Sleep(18000);
                var element2 = driver.FindElementById("sideMenu-GlobalSettings");
                Assert.IsTrue(element2.Displayed);

                
                driver.Quit();

            }
        }


        [TestMethod]
        public void ComponentsCheck()
        {

            System.Diagnostics.Trace.WriteLine("ComponentsCheck Test");
            var chromeOptions = new ChromeOptions();
            //chromeOptions.AddArguments("headless");

            using (var driver = new ChromeDriver(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location), chromeOptions))
            {
                
                driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(60);
                string eaurl = this.TestContext.Properties["url"].ToString(); 
                driver.Navigate().GoToUrl(eaurl);
                driver.Manage().Window.Maximize();

                Thread.Sleep(5000);
                // Find the text input element by its name
                string Username = this.TestContext.Properties["Username"].ToString();
                string Password = this.TestContext.Properties["Password"].ToString();
                driver.FindElementByXPath("//input[@name='Username']").SendKeys(Username);
                driver.FindElementByXPath("//input[@name='Password']").SendKeys(Password);
                driver.FindElementByXPath("//button[.='Login']").Click();

                Thread.Sleep(8000);

                //Navigate to ITMC from WebClient

                driver.FindElementByXPath("//span[.='EAAdmin']").Click();

                driver.FindElementByXPath("//span[contains(.,'IT Management')]").Click();
                driver.SwitchTo().Window(driver.WindowHandles[1]);

                var element2 = driver.FindElementById("sideMenu-GlobalSettings");
                Assert.IsTrue(element2.Displayed);
                element2.Click();
                Thread.Sleep(18000);
                driver.FindElementByXPath("//span[contains(.,'Components')]").Click();


                //verify ITManagementConsole
                var elementITManagementConsole = driver.FindElementByXPath("//label[contains(.,'ITManagementConsole')]");
                Assert.IsTrue(elementITManagementConsole.Displayed);

                //verify WebServer
                var elementWebserver = driver.FindElementByXPath("//label[contains(.,'WebServer')]");
                Assert.IsTrue(elementWebserver.Displayed);

                //verify SecurityTokenService
                var elementSecurityTokenService = driver.FindElementByXPath("//label[contains(.,'SecurityTokenService')]");
                Assert.IsTrue(elementSecurityTokenService.Displayed);

                //verify ApplicationServer
                var elementApplicationServer = driver.FindElementByXPath("//label[contains(.,'ApplicationServer')]");
                Assert.IsTrue(elementApplicationServer.Displayed);

                //verify ModellingWorkbench
                var elementModellingWorkbench = driver.FindElementByXPath("//label[contains(.,'ModellingWorkbench')]");
                Assert.IsTrue(elementModellingWorkbench.Displayed);


                //verify ModellingWorkbench
                var elementModelRepositoryService = driver.FindElementByXPath("//label[contains(.,'ModelRepositoryService')]");
                Assert.IsTrue(elementModelRepositoryService.Displayed);

                //"Check if logged in to ITMC"
                Thread.Sleep(10000);

                driver.Quit();

            }


        }
    }

}