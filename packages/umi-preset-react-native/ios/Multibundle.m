#import "Multibundle.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>

@implementation Multibundle

RCT_EXPORT_MODULE(Multibundle)

@synthesize bridge = _bridge;

RCT_EXPORT_METHOD(loadBundle:(NSString *)bundleName
    bundleId:(nonnull NSNumber *)bundleId
    resolver:(RCTPromiseResolveBlock)resolve
    rejecter:(RCTPromiseRejectBlock)reject)
{
    RCTBridge *bridge = _bridge;

    @try
    {
        NSURL *url = [[NSBundle mainBundle] URLForResource:bundleName withExtension:@"ios.bundle"];
        [bridge registerSegmentWithId:[bundleId unsignedIntegerValue] path:url.absoluteString];

        resolve(nil);
        
    } @catch (NSException * exception)
    {
        reject(@"error", @"error", nil);
    }
}

@end
