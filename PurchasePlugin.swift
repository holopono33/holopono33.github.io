//
//  PurchasePlugin.swift
//  App
//
//  Created by 358 holopono on 2026/05/20.
//
import Foundation
import Capacitor

@objc(PurchasePlugin)
public class PurchasePlugin: CAPPlugin {

    @objc func purchase(_ call: CAPPluginCall) {

        Task {

            do {

                let success = try await PurchaseManager.shared.purchase()

                call.resolve([
                    "success": success
                ])

            } catch {

                call.reject(error.localizedDescription)
            }
        }
    }

    @objc func restore(_ call: CAPPluginCall) {

        Task {

            do {

                let restored = try await PurchaseManager.shared.restore()

                call.resolve([
                    "success": restored
                ])

            } catch {

                call.reject(error.localizedDescription)
            }
        }
    }
}