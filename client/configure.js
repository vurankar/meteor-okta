Template.configureLoginServiceDialogForOkta.helpers({
    siteUrl: function () {
         return Meteor.absoluteUrl() + "_oauth/" + Okta.serviceName;
    }
});

Template.configureLoginServiceDialogForOkta.fields = function () {
    return [
        {property: 'clientId', label: 'Client ID'},
        {property: 'secret', label: 'Client secret'}
    ];
};