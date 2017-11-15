# Okta meteor package
__An implementation of the Okta OAuth flow__


## Getting started

Add the package to meteor
```
meteor add vurankar:okta
```

## Basic usage

The usage is pretty much the same as all other OAuth flow implementations for meteor. It's inspired by the official Google meteor package.
Basically you can use:

```javascript
var callback = Accounts.oauth.credentialRequestCompleteHandler(callback);
Okta.requestCredential(options, callback);
```


## References

### Accounts package

* [vurankar:accounts-okta](https://github.com/vurankar/meteor-accounts-okta)


