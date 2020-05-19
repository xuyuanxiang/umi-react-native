require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "umi-preset-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  umi-preset-react-native
                   DESC
  s.homepage     = "https://github.com/xuyuanxiang/umi-react-native#readme"
  s.license      = "MIT"
  s.authors      = { "xuyuanxiang" => "hi@xuyuanxiang.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/xuyuanxiang/umi-react-native.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,swift}"
  s.requires_arc = true

  s.dependency "React"
end

