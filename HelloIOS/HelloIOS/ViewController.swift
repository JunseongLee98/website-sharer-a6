//
//  ViewController.swift
//  HelloIOS
//
//  Created by Claude Code
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Set purple background
        view.backgroundColor = UIColor.purple

        // Create label
        let label = UILabel()
        label.text = "Go Dawgs!"
        label.textColor = UIColor.white
        label.font = UIFont(name: "HelveticaNeue-BoldItalic", size: 32)
        label.textAlignment = .left
        label.numberOfLines = 0

        // Position in upper-left corner
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)

        // Add constraints to position in upper-left
        NSLayoutConstraint.activate([
            label.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 20),
            label.leadingAnchor.constraint(equalTo: view.safeAreaLayoutGuide.leadingAnchor, constant: 20),
            label.trailingAnchor.constraint(lessThanOrEqualTo: view.safeAreaLayoutGuide.trailingAnchor, constant: -20)
        ])
    }
}
