//
//  PurchaseManager.swift
//  App
//
//  Created by 358 holopono on 2026/05/20.
//
import Foundation
import StoreKit

class PurchaseManager {

    static let shared = PurchaseManager()

    private init() {}

    let productIDs = ["encyclopedia_unlock"]

    func purchase() async throws -> Bool {

        let products = try await Product.products(for: productIDs)

        guard let product = products.first else {
            print("Product not found")
            return false
        }

        let result = try await product.purchase()

        switch result {

        case .success(let verification):
            switch verification {

            case .verified(_):
                return true

            case .unverified(_, _):
                return false
            }

        case .userCancelled:
            return false

        default:
            return false
        }
    }

    func restore() async throws -> Bool {

        for await result in Transaction.currentEntitlements {

            switch result {

            case .verified(let transaction):

                if transaction.productID == "encyclopedia_unlock" {
                    return true
                }

            default:
                break
            }
        }

        return false
    }
}